import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

// drizzle-kit runs outside Kit, so `$app/env/private` and its validation are not
// available here — this is the one place DATABASE_URL is read raw, hence the
// explicit dotenv load and the explicit guard.
if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is not set. Copy .env.example to .env first.');
}

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',
	dialect: 'postgresql',
	// No `driver` key: in drizzle-kit 0.31.x that field selects a vendor-specific
	// transport (d1-http, pglite, aws-data-api…). Plain Postgres uses none.
	dbCredentials: { url: process.env.DATABASE_URL },
	verbose: true,
	strict: true
});
