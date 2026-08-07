import { defineConfig, devices } from '@playwright/test';

/**
 * E2E runs against a real production build, never the dev server: CSP, asset
 * hashing, prerendering and `preload` behaviour all differ in dev, so a
 * dev-validated assertion proves nothing about what ships.
 *
 * `playwright install` is deliberately NOT part of this command (the scaffold
 * had it inline). It re-downloads browsers on every run and hides real failures
 * behind a download; `pnpm test:e2e:install` does it once.
 */
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
		reuseExistingServer: !process.env.CI,
		// A cold build plus preview is well past the 60s default.
		timeout: 180_000
	},

	use: {
		baseURL: 'http://localhost:4173',
		trace: 'on-first-retry'
	},

	projects: [
		{ name: 'chromium', use: { ...devices['Desktop Chrome'] } },
		{ name: 'firefox', use: { ...devices['Desktop Firefox'] } },

		// devices['Desktop Safari'] sets deviceScaleFactor 2 while Desktop Chrome
		// sets 1; mixing them in one screenshot suite doubles WebKit baselines.
		{ name: 'webkit', use: { ...devices['Desktop Safari'] } },

		// Playwright ships no descriptor at several of the widths brief §82
		// requires (820, 1024, 1280, 1440, 1728, 1920, 2560), so responsive specs
		// set an explicit viewport rather than pretending a device matches.
		{ name: 'mobile', use: { ...devices['iPhone 14'] } },

		/**
		 * Brief §116: the site must work without JavaScript. This is a first-class
		 * project rather than a per-test override so the guarantee cannot rot.
		 */
		{
			name: 'no-js',
			testMatch: '**/*.nojs.e2e.{ts,js}',
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
		}
	]
});
