import { defineConfig, devices } from '@playwright/test';

/**
 * E2E runs against a real production build, never the dev server: CSP, asset
 * hashing, prerendering and `preload` behaviour all differ in dev, so a
 * dev-validated assertion proves nothing about what ships.
 *
 * `playwright install` is deliberately NOT part of the webServer command (the
 * scaffold had it inline). It re-downloads browsers on every run and hides real
 * failures behind a download; `pnpm test:e2e:install` does it once.
 */

/**
 * Specs that WRITE to the database.
 *
 * These are quarantined into one serial project. The application throttles by
 * client address and every Playwright browser connects from 127.0.0.1, so all
 * projects share a single throttle bucket and a single set of rows. Run in
 * parallel across five projects, they truncate each other's data mid-test — a
 * full run produced 81 failures that were entirely cross-project interference,
 * while each project passed alone.
 *
 * The alternative — weakening the throttle or the reset for the benefit of the
 * tests — would mean the suite no longer exercises the shipped configuration.
 * Quarantining keeps the production rule intact.
 */
const DB_WRITING_SPECS = '**/inquiry*.e2e.{ts,js}';

export default defineConfig({
	testDir: 'src',
	testMatch: '**/*.e2e.{ts,js}',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],

	webServer: {
		command: 'pnpm build && pnpm preview',
		port: 4173,
		/**
		 * Never reuse. The command here BUILDS as well as serves, so reusing a
		 * running server silently tests a stale bundle — which cost real time
		 * chasing two "failures" that were fixed code the server had never seen,
		 * and would just as easily hide a regression behind a passing run.
		 * The build is a couple of seconds; a false result is not worth saving it.
		 */
		reuseExistingServer: false,
		// A cold build plus preview is well past the 60s default.
		timeout: 180_000
	},

	use: {
		baseURL: 'http://localhost:4173',
		trace: 'on-first-retry'
	},

	projects: [
		{
			name: 'chromium',
			testIgnore: DB_WRITING_SPECS,
			use: { ...devices['Desktop Chrome'] }
		},
		{
			name: 'firefox',
			testIgnore: DB_WRITING_SPECS,
			use: { ...devices['Desktop Firefox'] }
		},

		// devices['Desktop Safari'] sets deviceScaleFactor 2 while Desktop Chrome
		// sets 1; mixing them in one screenshot suite doubles WebKit baselines.
		{
			name: 'webkit',
			testIgnore: DB_WRITING_SPECS,
			use: { ...devices['Desktop Safari'] }
		},

		// Playwright ships no descriptor at several of the widths brief §82
		// requires (820, 1024, 1280, 1440, 1728, 1920, 2560), so responsive specs
		// set an explicit viewport rather than pretending a device matches.
		{
			name: 'mobile',
			testIgnore: DB_WRITING_SPECS,
			use: { ...devices['iPhone 14'] }
		},

		/**
		 * Brief §116: the site must work without JavaScript. A first-class project
		 * rather than a per-test override, so the guarantee cannot quietly rot.
		 */
		{
			name: 'no-js',
			testMatch: '**/*.nojs.e2e.{ts,js}',
			testIgnore: DB_WRITING_SPECS,
			use: { ...devices['Desktop Chrome'], javaScriptEnabled: false }
		},

		/**
		 * Brief §69. `reducedMotion` is NOT a top-level `use:` option in Playwright
		 * 1.62 — it lives on contextOptions. Every tutorial that writes
		 * `use: { reducedMotion: 'reduce' }` fails to typecheck.
		 */
		{
			name: 'reduced-motion',
			testMatch: '**/*.reduced.e2e.{ts,js}',
			use: { ...devices['Desktop Chrome'], contextOptions: { reducedMotion: 'reduce' } }
		},

		/**
		 * The database-writing project. One worker, no parallelism, so the shared
		 * throttle bucket and shared rows belong to exactly one test at a time.
		 * The no-JS inquiry specs set `javaScriptEnabled: false` at file level, so
		 * both the enhanced and the fallback paths run here, in order.
		 */
		{
			name: 'forms',
			testMatch: DB_WRITING_SPECS,
			fullyParallel: false,
			workers: 1,
			use: { ...devices['Desktop Chrome'] }
		}
	]
});
