import { test, expect, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';

/**
 * Visual regression. Brief §95.
 *
 * Determinism is the whole problem here, and this site has three sources of
 * nondeterminism: GSAP (which Playwright's `animations: 'disabled'` does NOT
 * stop, because it drives inline styles from its own ticker), a WebGL scene,
 * and webfont loading. Each is dealt with explicitly rather than hoped away:
 *
 *   - GSAP → a stylesheet injected at capture time pins the resting state.
 *   - WebGL → the `fallback` tier is forced, so the deterministic SVG renders
 *     instead of a GPU-dependent canvas. A screenshot of a SwiftShader render
 *     differs from a real GPU one, and both differ between engines.
 *   - Fonts → `document.fonts.ready` is awaited before every capture.
 *
 * Chromium only, deliberately. WebKit's `Desktop Safari` descriptor sets
 * deviceScaleFactor 2 against Chrome's 1, so mixing engines doubles the
 * baseline dimensions and compares nothing useful. Cross-browser correctness is
 * covered by the axe, keyboard and behaviour suites, which assert meaning
 * rather than pixels.
 *
 * BASELINES ARE PLATFORM-SPECIFIC. The snapshot path template includes the
 * platform, so a macOS baseline is never compared against a Linux CI run —
 * font hinting alone would fail every one. CI generates and commits its own.
 */

const STYLE_PATH = fileURLToPath(new URL('./visual.stylesheet.css', import.meta.url));

test.describe('visual regression', () => {
	test.skip(({ browserName }) => browserName !== 'chromium', 'baselines are Chromium-only');

	async function settle(page: Page, path: string) {
		// The fallback tier keeps the hero deterministic; see the note above.
		await page.goto(`${path}${path.includes('?') ? '&' : '?'}tier=fallback`);

		// Freeze anything that could differ between runs BEFORE the page scripts
		// have a chance to read them.
		await page.addInitScript(() => {
			Math.random = () => 0.42;
		});

		await page.evaluate(() => document.fonts.ready);
		// Long enough for reveals to have fired; the stylesheet pins them anyway.
		await page.waitForTimeout(1800);
		await page.evaluate(() => window.scrollTo(0, 0));
	}

	const VIEWS = [
		{ name: 'home', path: '/', width: 1440 },
		{ name: 'home-mobile', path: '/', width: 390 },
		{ name: 'home-tablet', path: '/', width: 768 },
		{ name: 'home-wide', path: '/', width: 2560 },
		{ name: 'work', path: '/work', width: 1440 },
		{ name: 'work-filtered', path: '/work?industry=FinTech', width: 1440 },
		{ name: 'case-study', path: '/work/meridian-markets', width: 1440 },
		{ name: 'services', path: '/services', width: 1440 },
		{ name: 'service-detail', path: '/services/real-time-systems', width: 1440 },
		{ name: 'article', path: '/insights/ai-features-need-failure-design', width: 1440 },
		{ name: 'contact', path: '/start-a-project', width: 1440 },
		{ name: 'contact-mobile', path: '/start-a-project', width: 390 },
		{ name: 'not-found', path: '/work/does-not-exist', width: 1440 }
	] as const;

	for (const view of VIEWS) {
		test(`${view.name} at ${view.width}px`, async ({ page }) => {
			await page.setViewportSize({ width: view.width, height: 900 });
			await settle(page, view.path);

			await expect(page).toHaveScreenshot(`${view.name}.png`, {
				fullPage: true,
				stylePath: STYLE_PATH,
				/**
				 * CALIBRATED, not guessed — and the first guess was wrong.
				 *
				 * `threshold` is the per-pixel YIQ colour tolerance: at 0.2 an
				 * antialiased text edge that differs slightly between runs is not
				 * counted as a differing pixel at all. That is what absorbs the real
				 * noise, so `maxDiffPixelRatio` does NOT also need to be loose.
				 *
				 * MEASURED, not guessed — and three earlier settings were wrong.
				 *
				 * A deliberate regression (shifting --azurite-500 from #289DD7 to
				 * #2F93CC) passed all 14 snapshots under `threshold: 0.2` +
				 * ratio 0.012, then again at ratio 0.0008, then again at 0.05/0.001.
				 * `threshold` is a per-pixel YIQ tolerance, and any value at or above
				 * ~0.05 treats those two blues as the SAME pixel, so nothing was ever
				 * counted as differing however tight the ratio got. A visual suite that
				 * cannot see a changed brand colour is decoration.
				 *
				 * With `threshold: 0` the two states are measurable and far apart:
				 *
				 *   clean run   ->  60-412 differing pixels across repeated runs
				 *   regression  ->  6,553-11,546 differing pixels
				 *
				 * The noise is text antialiasing on the 390px view, and it is not
				 * constant — 400 looked safe against a single 60-pixel sample and then
				 * flaked at 412 on one run in four. `maxDiffPixels: 800` clears the
				 * measured noise ceiling while staying an order of magnitude below the
				 * smallest real signal. An
				 * absolute count rather than a ratio because full-page heights vary
				 * enormously across these routes — a long article against the 404 —
				 * which makes a single ratio mean different things per view.
				 *
				 * Baselines are platform-scoped, so cross-machine font hinting never
				 * enters this comparison.
				 */
				threshold: 0,
				maxDiffPixels: 800,
				animations: 'disabled',
				caret: 'hide'
			});
		});
	}

	/**
	 * The mobile menu is captured separately because it needs an interaction, and
	 * a dialog in the top layer is exactly the kind of thing that regresses
	 * silently — nothing else in the suite would notice it losing its backdrop.
	 */
	test('mobile menu open at 390px', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await settle(page, '/');
		await page.getByRole('button', { name: 'Open menu' }).click();
		await page.waitForTimeout(400);

		await expect(page).toHaveScreenshot('mobile-menu.png', {
			stylePath: STYLE_PATH,
			threshold: 0,
			maxDiffPixels: 800,
			animations: 'disabled',
			caret: 'hide'
		});
	});
});
