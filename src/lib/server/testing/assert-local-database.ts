/**
 * Refuse to run the test suite against a non-local database.
 *
 * This exists because it nearly happened. `vercel link` and
 * `vercel integration add neon` both write a `.env.local`, and Vite loads
 * `.env.local` at HIGHER priority than `.env` — so the moment the project was
 * linked and a Neon database provisioned, every local `pnpm test:unit` run
 * silently retargeted from `localhost` to the production database. The
 * integration suite writes rows and deletes them. It only failed rather than
 * corrupting production because the schema had not been migrated yet.
 *
 * Nothing about that was visible: no output named the host, and the test names
 * were unchanged. The failure looked like broken code.
 *
 * A `.gitignore` entry does not help — the file is meant to exist locally. The
 * only reliable guard is the suite refusing to talk to a host it does not
 * recognise as local, which is what this does.
 */

/**
 * Hostnames that are unambiguously this machine. Deliberately an allowlist:
 * a denylist of "known production hosts" is a list nobody maintains, and the
 * first unlisted host is the one that costs you a database.
 */
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0', 'host.docker.internal']);

export function assertLocalDatabase(url: string | undefined): void {
	if (!url?.trim()) return; // Not configured: the suite's own guards handle that.

	let hostname: string;
	try {
		hostname = new URL(url).hostname;
	} catch {
		throw new Error('DATABASE_URL is not a parseable URL.');
	}

	if (LOCAL_HOSTS.has(hostname)) return;

	throw new Error(
		`Refusing to run tests against a non-local database.\n\n` +
			`  DATABASE_URL points at: ${hostname}\n\n` +
			`The integration suite writes and deletes rows. Running it against a ` +
			`remote database would mutate real data.\n\n` +
			`The usual cause is a .env.local written by \`vercel link\` or ` +
			`\`vercel integration add\`, which Vite loads in preference to .env. ` +
			`Delete .env.local, or point DATABASE_URL back at localhost.`
	);
}

assertLocalDatabase(process.env.DATABASE_URL);
