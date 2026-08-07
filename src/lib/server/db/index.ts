import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { DATABASE_URL } from '$app/env/private';
import * as schema from './schema';

/**
 * node-postgres, not Neon's HTTP driver, for BOTH environments.
 *
 * @sveltejs/adapter-vercel@7 dropped the edge runtime entirely — its
 * `valid_runtimes` is `['nodejs22.x', 'nodejs24.x', 'bun1.x']` — so raw TCP is
 * available in production and one driver can serve local Postgres and Neon
 * alike. The reverse is not true: `@neondatabase/serverless` speaks Neon's
 * SQL-over-HTTP protocol rather than the Postgres wire protocol, and cannot
 * reach a local Postgres at all without running Neon's proxy in Docker.
 *
 * No `if (!DATABASE_URL) throw` guard is needed here any more: src/env.ts
 * validates the variable at startup and Kit fails loudly before this module runs.
 */

/**
 * Branch TLS on the URL, never on `dev`. Neon's TCP endpoint requires
 * `sslmode=require`; a Homebrew Postgres on localhost serves no TLS at all. An
 * unconditional `ssl: true` breaks local development and an unconditional
 * `ssl: false` breaks production, so the connection string decides.
 */
function needsTls(url: string): boolean {
	const { hostname, searchParams } = new URL(url);
	if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') return false;
	return searchParams.get('sslmode') !== 'disable';
}

const client = new pg.Pool({
	connectionString: DATABASE_URL,
	...(needsTls(DATABASE_URL) ? { ssl: { rejectUnauthorized: true } } : {}),

	// One connection per instance. Serverless scales by process, so pg's default
	// pool of 10 multiplies by every concurrent instance and exhausts the
	// provider's connection limit long before it does anything useful.
	max: 1,
	idleTimeoutMillis: 10_000,
	connectionTimeoutMillis: 10_000
});

export const db = drizzle(client, { schema });
