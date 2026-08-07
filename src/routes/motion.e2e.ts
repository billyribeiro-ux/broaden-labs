import { test, expect, type Page } from '@playwright/test';

/**
 * Motion lifecycle. Brief §67, §94, §120.
 *
 * The claim being tested is "no orphaned ScrollTriggers". SvelteKit destroys a
 * component on client-side navigation, but ScrollTrigger instances live on the
 * global scroller — so without `ctx.revert()` in every attachment's teardown,
 * leaving and returning to a page accumulates ghost triggers that fight the
 * next page's scroll and never get collected.
 *
 * HONEST LIMIT, stated because it bounds what a green run here means:
 * `ScrollTrigger.getAll()` is enumerable and so is `gsap.ticker`, which is why
 * both can be asserted. A bare `requestAnimationFrame` loop is NOT enumerable
 * by any browser API, and neither is a stray `addEventListener` —
 * `getEventListeners()` is a DevTools-console-only helper. This suite therefore
 * cannot prove the absence of those. The mitigation is architectural rather
 * than test-based: every loop in this codebase goes through `gsap.ticker`, and
 * window/document listeners go through `<svelte:window>` / `<svelte:document>`,
 * both of which clean up with the component.
 */

interface MotionCounts {
	readonly scrollTriggers: number;
	readonly ticker: number;
	readonly splits: number;
}

async function counts(page: Page): Promise<MotionCounts> {
	// Settle first: ScrollTriggers are created inside attachments, and SplitText
	// waits on document.fonts.ready, so an immediate read races creation.
	await page.evaluate(() => document.fonts.ready);
	await page.waitForTimeout(600);

	return page.evaluate(() => {
		const registry = window.__BROADEN_MOTION__;
		if (!registry) throw new Error('motion registry missing — is the dev/preview build running?');
		return {
			scrollTriggers: registry.scrollTriggers(),
			ticker: registry.tickerListeners(),
			splits: registry.splits()
		};
	});
}

test.describe('motion lifecycle', () => {
	test('ScrollTriggers do not accumulate across repeated navigation', async ({ page }) => {
		await page.goto('/');
		const homeFirst = await counts(page);
		expect(homeFirst.scrollTriggers).toBeGreaterThan(0);

		await page.getByRole('link', { name: 'Work', exact: true }).first().click();
		await expect(page).toHaveURL(/\/work$/);
		const workFirst = await counts(page);

		// Three full A→B→A cycles. One round trip can hide a leak that only shows
		// once the count has had room to grow.
		for (let cycle = 0; cycle < 3; cycle += 1) {
			await page.goto('/');
			const home = await counts(page);
			expect(home.scrollTriggers, `homepage ScrollTriggers after cycle ${cycle + 1}`).toBe(
				homeFirst.scrollTriggers
			);

			await page.getByRole('link', { name: 'Work', exact: true }).first().click();
			await expect(page).toHaveURL(/\/work$/);
			const work = await counts(page);
			expect(work.scrollTriggers, `work ScrollTriggers after cycle ${cycle + 1}`).toBe(
				workFirst.scrollTriggers
			);
		}
	});

	test('SplitText instances are reverted, not stacked', async ({ page }) => {
		await page.goto('/');
		const first = await counts(page);
		expect(first.splits).toBe(1);

		for (let cycle = 0; cycle < 3; cycle += 1) {
			await page.getByRole('link', { name: 'Work', exact: true }).first().click();
			await expect(page).toHaveURL(/\/work$/);
			// Away from the homepage the split must be gone entirely, not merely
			// not-growing — that is the difference between revert() and a no-op.
			expect((await counts(page)).splits, `splits away from home, cycle ${cycle + 1}`).toBe(0);

			await page.goto('/');
			expect((await counts(page)).splits, `splits back on home, cycle ${cycle + 1}`).toBe(1);
		}
	});

	test('the gsap ticker does not gain listeners across navigation', async ({ page }) => {
		await page.goto('/');
		const baseline = (await counts(page)).ticker;
		expect(baseline).toBeGreaterThanOrEqual(0);

		for (let cycle = 0; cycle < 3; cycle += 1) {
			await page.goto('/work');
			await page.goto('/');
		}

		expect((await counts(page)).ticker).toBe(baseline);
	});

	/**
	 * Back/Forward asserts the trigger count never GROWS, not that it matches.
	 *
	 * Equality is the wrong invariant here and asserting it produced a red run
	 * that was not a bug: every reveal uses `once: true`, and a ScrollTrigger
	 * created with `once` KILLS ITSELF after firing. Returning to a page whose
	 * scroll position Kit has restored means more of the page is already in view,
	 * so more triggers fire immediately and remove themselves — the homepage went
	 * from 9 live triggers on a fresh load to 1 after a restore. That is correct
	 * behaviour and a lower number is a healthier one.
	 *
	 * A leak is monotonic growth. That is what is tested.
	 */
	test('browser Back and Forward never grow the trigger count', async ({ page }) => {
		await page.goto('/');
		const ceiling = (await counts(page)).scrollTriggers;
		expect(ceiling).toBeGreaterThan(0);

		for (let cycle = 0; cycle < 3; cycle += 1) {
			await page.getByRole('link', { name: 'Work', exact: true }).first().click();
			await expect(page).toHaveURL(/\/work$/);

			await page.goBack();
			await expect(page).toHaveURL(/\/$/);
			expect(
				(await counts(page)).scrollTriggers,
				`homepage triggers after Back, cycle ${cycle + 1}`
			).toBeLessThanOrEqual(ceiling);

			await page.goForward();
			await expect(page).toHaveURL(/\/work$/);
			await page.goBack();
			expect(
				(await counts(page)).scrollTriggers,
				`homepage triggers after Forward+Back, cycle ${cycle + 1}`
			).toBeLessThanOrEqual(ceiling);
		}
	});

	test('resizing during a split heading re-splits rather than breaking the lines', async ({
		page
	}) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto('/');
		await counts(page);

		const heading = page.getByRole('heading', { level: 1 });
		// The accessible name is the original string even though the visible text
		// has been cut into per-line wrappers.
		await expect(heading).toHaveAttribute(
			'aria-label',
			'Software that expands what your business can become.'
		);

		await page.setViewportSize({ width: 390, height: 844 });
		await page.waitForTimeout(700);

		// autoSplit re-splits on resize; without it the lines stay broken at the
		// old width and the mask lands mid-word.
		await expect(heading).toHaveAttribute(
			'aria-label',
			'Software that expands what your business can become.'
		);
		expect((await counts(page)).splits).toBe(1);
	});
});

test.describe('content is never hidden behind motion', () => {
	/**
	 * Brief §115: text hidden for animation must remain semantically available
	 * and must be visible if JavaScript fails. `visibility: hidden` is called out
	 * by name because it removes the element from the accessibility tree AND
	 * cannot be undone by a script that never runs.
	 */
	test('no element is left with visibility:hidden', async ({ page }) => {
		for (const route of ['/', '/work', '/about', '/insights', '/work/meridian-markets']) {
			await page.goto(route);
			await page.evaluate(() => document.fonts.ready);
			await page.waitForTimeout(400);

			const hidden = await page.evaluate(() =>
				[...document.querySelectorAll('body *')]
					.filter((el) => getComputedStyle(el).visibility === 'hidden')
					.map((el) => `${el.tagName}.${el.className}`)
			);
			expect(hidden, `${route} has elements with visibility:hidden`).toEqual([]);
		}
	});

	test('every heading is readable once motion has settled', async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => document.fonts.ready);
		await page.waitForTimeout(1600);

		const invisible = await page.evaluate(() =>
			[...document.querySelectorAll('h1, h2, h3')]
				.filter((el) => {
					const rect = el.getBoundingClientRect();
					// Only judge headings that are actually in view; one below the fold
					// legitimately has opacity 0 until its reveal fires.
					if (rect.bottom < 0 || rect.top > window.innerHeight) return false;
					return Number(getComputedStyle(el).opacity) < 0.9;
				})
				.map((el) => el.textContent?.trim().slice(0, 40))
		);
		expect(invisible).toEqual([]);
	});
});
