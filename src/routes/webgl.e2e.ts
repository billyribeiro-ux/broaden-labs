import { test, expect } from '@playwright/test';

/**
 * WebGL capability tiers and safety. Brief §74, §75, §76, §83.
 *
 * The claim is that the page is complete and usable in all four tiers, that
 * nothing meaningful lives inside the canvas, and that the scene never breaks
 * hydration or leaks a context. Each tier is FORCED and exercised for real
 * rather than asserting that the detector returns the right string.
 */

const TIERS = ['rich', 'medium', 'still', 'fallback'] as const;

test.describe('capability tiers', () => {
	for (const tier of TIERS) {
		test(`${tier}: renders, stays interactive, and logs nothing`, async ({ page }) => {
			await page.goto(`/?tier=${tier}`);
			await page.evaluate(() => document.fonts.ready);
			await page.waitForTimeout(2200);

			const stage = page.locator('.stage');
			await expect(stage).toHaveAttribute('data-tier', tier);

			// The fallback tier must render the SVG and NO canvas; the others the
			// reverse. A tier that silently renders neither would still "pass" a
			// looser assertion.
			const canvas = page.locator('.stage canvas');
			const svg = page.locator('.stage svg');
			if (tier === 'fallback') {
				await expect(canvas).toHaveCount(0);
				await expect(svg).toHaveCount(1);
			} else {
				await expect(canvas).toHaveCount(1);
			}

			// Content is identical in every tier — the scene is decoration.
			await expect(page.getByRole('heading', { level: 1 })).toHaveText(
				/Software that expands what your business can become/
			);
			await expect(page.getByRole('link', { name: 'Start a project' }).first()).toBeVisible();

			const messages = await page.consoleMessages({ filter: 'since-navigation' });
			const errors = messages.filter((m) => m.type() === 'error').map((m) => m.text());
			expect([...errors, ...(await page.pageErrors()).map((e) => e.message)]).toEqual([]);
		});
	}

	test('the CTA is clickable through the stage in every tier', async ({ page }) => {
		for (const tier of TIERS) {
			await page.goto(`/?tier=${tier}`);
			await page.waitForTimeout(1200);

			// Scroll it into view FIRST. `elementFromPoint` is viewport-relative and
			// returns null for coordinates outside it, so on a 390x664 screen — where
			// the hero CTA sits below the fold — an unscrolled hit test fails for
			// geometry reasons rather than because anything is blocking the click.
			const cta = page.getByRole('link', { name: 'Start a project' }).first();
			await cta.scrollIntoViewIfNeeded();

			/**
			 * Hit-tests the element PLAYWRIGHT resolved, via `locator.evaluate`,
			 * rather than re-querying inside the page.
			 *
			 * `document.querySelector('a[href="/start-a-project"]')` returns the
			 * first match in document order, and on a mobile viewport that is the
			 * CTA inside the closed <dialog> — a `display: none` element measuring
			 * 0x0. The hit test then compared the hero button against a point at the
			 * origin and reported the stage as blocking, which it never was.
			 */
			const reachable = await cta.evaluate((link) => {
				const rect = link.getBoundingClientRect();
				const top = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
				return top !== null && link.contains(top);
			});
			expect(reachable, `${tier} tier blocks the CTA`).toBe(true);

			// And it genuinely navigates, which is the thing the hit test stands in for.
			await cta.click();
			await expect(page).toHaveURL(/start-a-project/);
		}
	});
});

test.describe('server rendering and hydration', () => {
	/**
	 * The tier starts at `fallback` and only upgrades on the client, which is
	 * what makes the scene SSR-safe without a `{#if browser}` guard. This asserts
	 * it from the raw HTML rather than the hydrated DOM — the two differ, and the
	 * raw response is the one search engines and no-JS visitors receive.
	 */
	test('the server emits the SVG fallback, never a canvas', async ({ request }) => {
		const response = await request.get('/');
		const html = await response.text();

		expect(html).toContain('data-tier="fallback"');
		expect(html).not.toContain('<canvas');
	});

	test('hydration produces no warnings or mismatches', async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => document.fonts.ready);
		await page.waitForTimeout(2000);

		const messages = await page.consoleMessages({ filter: 'since-navigation' });
		const noisy = messages
			.filter((m) => m.type() === 'error' || m.type() === 'warning')
			.map((m) => m.text())
			// Svelte reports hydration problems by name, so this catches the actual
			// failure mode rather than any warning at all.
			.filter((text) => /hydrat|mismatch/i.test(text));

		expect(noisy).toEqual([]);
	});
});

test.describe('the canvas carries no information', () => {
	/**
	 * Brief §83: "no meaningful information exclusively inside Canvas." The scene
	 * is decoration, so it must be hidden from assistive technology entirely and
	 * the hero must read identically without it.
	 */
	test('the stage is inert to assistive technology', async ({ page }) => {
		await page.goto('/?tier=rich');
		await page.waitForTimeout(1500);

		// Anything the scene draws is unreachable by a screen reader, and nothing
		// in the accessible tree comes from it.
		const stageText = await page.locator('.stage').innerText();
		expect(stageText.trim()).toBe('');

		const svgHidden = await page.evaluate(() => {
			const svg = document.querySelector('.stage svg');
			return svg ? svg.getAttribute('aria-hidden') : 'no-svg-in-this-tier';
		});
		expect(['true', 'no-svg-in-this-tier']).toContain(svgHidden);
	});

	test('the hero reads identically with and without the scene', async ({ page }) => {
		/**
		 * Compares NORMALISED textContent, not innerText.
		 *
		 * innerText reflects rendered line boxes, and SplitText wraps the headline
		 * in one div per visual line — so the two tiers differ by newlines that
		 * have nothing to do with WebGL. textContent with collapsed whitespace is
		 * what a screen reader receives, which is the thing that actually has to
		 * match.
		 */
		const heroText = async () =>
			(await page.locator('.hero .content').textContent())?.replace(/\s+/g, ' ').trim();

		await page.goto('/?tier=fallback');
		await page.evaluate(() => document.fonts.ready);
		await page.waitForTimeout(1500);
		const withoutScene = await heroText();

		await page.goto('/?tier=rich');
		await page.evaluate(() => document.fonts.ready);
		await page.waitForTimeout(1500);
		const withScene = await heroText();

		expect(withScene).toBe(withoutScene);
		expect(withScene).toContain('Software that expands what your business can become.');
	});
});

test.describe('scene lifecycle', () => {
	/**
	 * Browsers cap the number of live WebGL contexts (~16 in Chromium). A scene
	 * that creates one per visit and never releases it takes down the canvas
	 * silently after enough navigations — the classic symptom being a hero that
	 * renders on first load and is blank after browsing the site for a minute.
	 */
	test('ten navigations away and back leave the scene working', async ({ page }) => {
		await page.goto('/?tier=rich');
		await page.waitForTimeout(1200);
		await expect(page.locator('.stage canvas')).toHaveCount(1);

		for (let visit = 0; visit < 10; visit += 1) {
			await page.goto('/work');
			await page.goto('/?tier=rich');
		}
		await page.waitForTimeout(1500);

		// Still exactly one canvas, still drawing.
		await expect(page.locator('.stage canvas')).toHaveCount(1);
		const drawing = await page.evaluate(() => {
			const canvas = document.querySelector('.stage canvas');
			if (!(canvas instanceof HTMLCanvasElement)) return false;
			const gl = canvas.getContext('webgl2');
			// A lost context reports true here, which is exactly the failure this
			// test exists to catch.
			return gl !== null && !gl.isContextLost();
		});
		expect(drawing).toBe(true);

		const errors = (await page.consoleMessages({ filter: 'since-navigation' }))
			.filter((m) => m.type() === 'error')
			.map((m) => m.text());
		expect(errors).toEqual([]);
	});
});
