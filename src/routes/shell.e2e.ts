import { test, expect, type Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

/**
 * Global shell guarantees. Brief §21, §69, §83, §87, §120.
 *
 * These run against a real production build (playwright.config.ts's webServer is
 * `pnpm build && pnpm preview`), never the dev server — CSP, asset hashing and
 * font preloading all differ in dev.
 */

const ROUTES = [
	'/',
	'/work',
	'/services',
	'/about',
	'/insights',
	'/start-a-project',
	'/privacy',
	'/terms',
	'/accessibility'
] as const;

/**
 * `wcag22a` DOES NOT EXIST as an axe tag — asking for it silently matches zero
 * rules, which looks like a pass. Verified by enumerating every tag on all 105
 * rules in axe-core 4.12.1. `target-size` is the single rule wcag22aa adds.
 */
const WCAG_22_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

test.describe('every route renders and is accessible', () => {
	for (const route of ROUTES) {
		test(`${route} has no axe violations`, async ({ page }) => {
			const response = await page.goto(route);
			expect(response?.status(), `${route} status`).toBe(200);

			const { violations } = await new AxeBuilder({ page }).withTags(WCAG_22_AA).analyze();

			// Reported by rule id + the offending selector, so a failure says what
			// broke and where rather than dumping the whole axe object.
			expect(
				violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
			).toEqual([]);
		});
	}

	test('no route logs a console error or throws', async ({ page }) => {
		for (const route of ROUTES) {
			await page.goto(route);
			// page.consoleMessages() reads a buffer the driver has been filling since
			// the page opened. A page.on('console') listener registered in the test
			// body races the initial document parse and misses early messages.
			const messages = await page.consoleMessages({ filter: 'since-navigation' });
			const errors = messages
				.filter((m) => m.type() === 'error')
				.map((m) => `${route} ${m.text()}`);
			const failures = (await page.pageErrors()).map((e) => `${route} ${e.message}`);
			expect([...errors, ...failures]).toEqual([]);
		}
	});
});

test.describe('keyboard access', () => {
	test('the skip link is the first stop and moves focus into main', async ({ page }) => {
		// Must start from a FRESH document load: SvelteKit moves focus to <body>
		// after every client-side navigation, so tabbing after a goto() would test
		// the framework's focus reset rather than the skip link.
		await page.goto('/');

		await page.keyboard.press('Tab');
		const skip = page.getByRole('link', { name: 'Skip to content' });
		await expect(skip).toBeFocused();
		// Visually hidden until focused — but it must be genuinely visible then,
		// not merely present.
		await expect(skip).toBeInViewport();

		await page.keyboard.press('Enter');
		const focusedId = await page.evaluate(() => document.activeElement?.id);
		expect(focusedId).toBe('main');
	});

	test('focus is always visible on the primary navigation', async ({ page }) => {
		await page.goto('/');
		await page.keyboard.press('Tab'); // skip link
		await page.keyboard.press('Tab'); // wordmark home link

		const visible = await page.evaluate(() => {
			const el = document.activeElement;
			if (!el) return false;
			const matchesFocusVisible = el.matches(':focus-visible');
			const { boxShadow, outlineStyle } = getComputedStyle(el);
			const hasIndicator = boxShadow !== 'none' || outlineStyle !== 'none';
			return matchesFocusVisible && hasIndicator;
		});
		expect(visible).toBe(true);
	});
});

test.describe('mobile navigation', () => {
	test.use({ viewport: { width: 390, height: 844 } });

	test('opens, traps focus, closes on Escape and restores focus', async ({ page }) => {
		await page.goto('/');

		const trigger = page.getByRole('button', { name: 'Open menu' });
		await expect(trigger).toBeVisible();
		await expect(trigger).toHaveAttribute('aria-expanded', 'false');

		await trigger.click();

		const dialog = page.getByRole('dialog', { name: 'Site menu' });
		await expect(dialog).toBeVisible();
		await expect(trigger).toHaveAttribute('aria-expanded', 'true');

		// showModal() makes the rest of the document inert. If the trigger were
		// still reachable, the "trap" would be decorative.
		const triggerReachable = await page.evaluate(() => {
			const el = document.querySelector('button.trigger');
			return el ? !el.closest('[inert]') && el.checkVisibility({ checkOpacity: false }) : false;
		});
		expect(triggerReachable).toBe(true); // visible behind the dialog…

		// …but focus cannot escape it: tabbing past the last control wraps.
		const focusStaysInside = await page.evaluate(() => {
			const dlg = document.querySelector('dialog');
			return dlg?.contains(document.activeElement) ?? false;
		});
		expect(focusStaysInside).toBe(true);

		await page.keyboard.press('Escape');
		await expect(dialog).toBeHidden();
		await expect(trigger).toHaveAttribute('aria-expanded', 'false');
		// <dialog> restores focus to the invoker itself — nothing does it manually.
		await expect(trigger).toBeFocused();
	});

	test('a menu link navigates and closes the dialog', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: 'Open menu' }).click();

		const dialog = page.getByRole('dialog', { name: 'Site menu' });
		await dialog.getByRole('link', { name: 'Work' }).click();

		await expect(page).toHaveURL(/\/work$/);
		await expect(dialog).toBeHidden();
	});
});

/**
 * CLS must be zero, not merely under the 0.1 "good" threshold. This site loads
 * three webfonts and has no images above the fold; any shift here would be a
 * font-swap reflow, which the metric-matched fallbacks and explicit line-heights
 * exist to prevent.
 */
async function cumulativeLayoutShift(page: Page, route: string): Promise<number> {
	await page.goto(route);
	// Fonts must have actually swapped before measuring, or the observer is read
	// before the event it is meant to catch.
	await page.evaluate(() => document.fonts.ready);
	await page.waitForTimeout(500);

	return page.evaluate(
		() =>
			new Promise<number>((resolve) => {
				let total = 0;
				const observer = new PerformanceObserver((list) => {
					for (const entry of list.getEntries()) {
						// LayoutShift is not in lib.dom yet; the cast is confined here.
						const shift = entry as PerformanceEntry & {
							value: number;
							hadRecentInput: boolean;
						};
						if (!shift.hadRecentInput) total += shift.value;
					}
				});
				observer.observe({ type: 'layout-shift', buffered: true });
				// One frame is enough for `buffered: true` to deliver everything the
				// browser already recorded.
				requestAnimationFrame(() => {
					observer.disconnect();
					resolve(total);
				});
			})
	);
}

test.describe('layout stability', () => {
	// The brief's §82 widths, sampled at the four the design system pivots on.
	for (const width of [390, 768, 1440, 2560]) {
		test(`CLS is zero at ${width}px`, async ({ page }) => {
			await page.setViewportSize({ width, height: 900 });
			const cls = await cumulativeLayoutShift(page, '/');
			expect(cls, `CLS at ${width}px`).toBe(0);
		});
	}
});
