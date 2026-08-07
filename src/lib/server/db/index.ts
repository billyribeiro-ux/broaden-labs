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

/**
 * The connection is LAZY.
 *
 * `DATABASE_URL` is optional at build time (see src/env.ts) because
 * prerendering this site touches no database — requiring it made a Vercel
 * deployment fail before a database existed. Constructing the pool eagerly here
 * would reintroduce exactly that, because this module is imported by the
 * remote-function bundle, which the build analyses.
 *
 * So nothing connects until something actually queries. A deployment without a
 * database serves every marketing page perfectly and fails only the inquiry
 * form, with a message that says what is wrong.
 */
let pool: pg.Pool | undefined;

function connect(): pg.Pool {
	if (pool) return pool;

	if (!DATABASE_URL) {
		throw new Error(
			'DATABASE_URL is not configured. The inquiry form needs a database; ' +
				'the rest of the site does not. Set it in the deployment environment.'
		);
	}

	pool = new pg.Pool({
		connectionString: DATABASE_URL,
		...(needsTls(DATABASE_URL) ? { ssl: { rejectUnauthorized: true } } : {}),

		// One connection per instance. Serverless scales by process, so pg's
		// default pool of 10 multiplies by every concurrent instance and exhausts
		// the provider's connection limit long before it does anything useful.
		max: 1,
		idleTimeoutMillis: 10_000,
		connectionTimeoutMillis: 10_000
	});

	return pool;
}

/**
 * A Proxy so every call site keeps writing `db.select(...)` unchanged while the
 * underlying pool is created on first use. The alternative — threading a
 * `getDb()` through fifteen call sites — would put the laziness in every
 * repository instead of in the one place that owns the connection.
 */
export const db: ReturnType<typeof drizzle> = new Proxy({} as ReturnType<typeof drizzle>, {
	get(_target, property, receiver) {
		const instance = drizzle(connect(), { schema });
		return Reflect.get(instance, property, receiver);
	}
});
