import 'dotenv/config';
import pg from 'pg';

/**
 * Truncates the inquiry tables between E2E tests.
 *
 * Playwright drives a real browser against a real server, so every test in the
 * suite submits from the same client address — 127.0.0.1 — and therefore shares
 * one throttle bucket. Without a reset the third submission in the whole run is
 * rejected as throttled, which looks like a broken duplicate check.
 *
 * The alternative would have been to weaken the throttle for tests, which would
 * mean the tests no longer exercise the shipped configuration. Resetting state
 * keeps the production rule intact and makes the suite deterministic.
 *
 * Uses `pg` directly rather than the app's db module, because that module
 * imports `$app/env/private`, which does not resolve inside the Playwright
 * process.
 */
export async function resetInquiryTables(): Promise<void> {
	const connectionString = process.env.DATABASE_URL;
	if (!connectionString) {
		throw new Error('DATABASE_URL is not set. E2E tests need the local database.');
	}

	const client = new pg.Client({ connectionString });
	await client.connect();
	try {
		await client.query(
			'truncate table contact_events, project_inquiries, newsletter_subscribers restart identity cascade'
		);
	} finally {
		await client.end();
	}
}
