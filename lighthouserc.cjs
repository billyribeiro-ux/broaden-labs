/**
 * Lighthouse CI. Brief §87, §120.
 *
 * This runs against a real production build (`pnpm build && pnpm preview`) for
 * the same reason the Playwright suite does: CSP, asset hashing, prerendering
 * and preload behaviour all differ in dev, so a dev-server score measures a
 * bundle nobody is ever served.
 *
 * It does NOT replace `shell.e2e.ts`, which measures CLS and LCP directly under
 * CDP throttling. That catches regressions in one metric with a precise cause;
 * this catches the whole-page picture — unminified payloads, missing
 * compression, render-blocking resources, a11y and SEO — that a targeted
 * measurement cannot see. Both are cheap, and they have caught different things.
 */

const { chromium } = require('playwright');

/**
 * Chrome comes from Playwright, not from whatever the machine happens to have.
 *
 * Lighthouse's score is a function of the browser it runs in, so a developer's
 * Chrome Canary and CI's stable build would disagree and the assertions would
 * mean two different things. Playwright's pinned Chromium is already installed
 * for the E2E suite, is identical on every machine, and is the same binary the
 * `chromium` Playwright project measures CWV in.
 *
 * CHROME_PATH still wins if it is set, so a CI image with its own Chrome can
 * override without editing this file.
 */
function resolveChrome() {
	if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
	try {
		return chromium.executablePath();
	} catch {
		// Let Lighthouse fall back to its own detection and say so, rather than
		// failing here with a stack trace about Playwright.
		console.warn('[lighthouse] Playwright Chromium not found; falling back to system Chrome.');
		return undefined;
	}
}

/**
 * One representative page per rendering strategy and per template, not every
 * route — the 30 pages here share four layouts, so testing all of them would
 * multiply runtime without testing anything new.
 *
 * `/start-a-project` is the important one: it is the ONLY route that is not
 * prerendered, so it is the only one whose score includes a serverless function
 * response rather than a static file read.
 */
const URLS = [
	'http://localhost:4173/',
	'http://localhost:4173/work',
	'http://localhost:4173/work/meridian-markets',
	'http://localhost:4173/insights/ai-features-need-failure-design',
	'http://localhost:4173/start-a-project'
];

module.exports = {
	ci: {
		collect: {
			url: URLS,
			startServerCommand: 'pnpm build && pnpm preview',
			startServerReadyPattern: 'Local:',
			startServerReadyTimeout: 180_000,

			/**
			 * Three runs, asserted on the MEDIAN RUN rather than the median of each
			 * metric independently.
			 *
			 * Lighthouse is noisy enough on a single run that a green build is not
			 * evidence of anything. `median-run` keeps one internally consistent
			 * report — the same trace produced every number in it — where `median`
			 * would synthesise a page that never existed, with an LCP from one run
			 * and a TBT from another.
			 */
			numberOfRuns: 3,

			settings: {
				chromePath: resolveChrome(),
				// Headless matches CI, where there is no display to render into.
				chromeFlags: '--headless=new --no-sandbox --disable-dev-shm-usage',

				/**
				 * MOBILE, throttled — Lighthouse's default, and deliberately not the
				 * desktop preset. Google's indexing is mobile-first, so the mobile
				 * score is the one that describes what is actually evaluated. The
				 * desktop numbers are strictly better and would hide regressions.
				 */
				formFactor: 'mobile',
				screenEmulation: {
					mobile: true,
					width: 390,
					height: 844,
					deviceScaleFactor: 2.625,
					disabled: false
				},

				/**
				 * `uses-http2` is the ONE audit skipped, and only because it measures
				 * the local preview server rather than the site: `vite preview` speaks
				 * HTTP/1.1, while Vercel serves HTTP/2 and HTTP/3 unconditionally. It
				 * would fail here forever while being true nowhere.
				 *
				 * Nothing else is skipped. `canonical` and `is-crawlable` in particular
				 * are kept — they are exactly the SEO regressions worth catching.
				 */
				skipAudits: ['uses-http2']
			}
		},

		// An `assertMatrix`, not a flat `assertions` object: /start-a-project is
		// held to a different performance bar than the prerendered routes, and the
		// reason is documented there rather than left as an unexplained exception.
		assert: require('./lighthouse-assertions.cjs'),

		upload: {
			// No LHCI server. Reports land on disk and CI uploads them as an
			// artifact, so a failed assertion can be opened rather than guessed at.
			target: 'filesystem',
			outputDir: './.lighthouseci/reports',
			reportFilenamePattern: '%%PATHNAME%%-%%DATETIME%%.report.%%EXTENSION%%'
		}
	}
};
