import { test, expect } from '@playwright/test';

/**
 * Reduced motion. Brief §69, §93 (scenario 13).
 *
 * Runs in the `reduced-motion` Playwright project, where the context is created
 * with `contextOptions: { reducedMotion: 'reduce' }`. That is NOT a top-level
 * `use:` option in Playwright 1.62 — every tutorial that writes
 * `use: { reducedMotion: 'reduce' }` fails to typecheck.
 *
 * The requirement is not "less motion". It is that content, layout and every
 * interaction survive intact, and that nothing is required to move for the page
 * to be understood.
 */

const ROUTES = ['/', '/work', '/about', '/insights', '/work/meridian-markets'] as const;

test.describe('with prefers-reduced-motion: reduce', () => {
	test('the media query is actually applied', async ({ page }) => {
		await page.goto('/');
		// Guards the whole file: if emulation silently stopped working, every other
		// assertion here would pass for the wrong reason.
		const reduced = await page.evaluate(
			() => window.matchMedia('(prefers-reduced-motion: reduce)').matches
		);
		expect(reduced).toBe(true);
	});

	test('motion tokens collapse to imperceptible durations', async ({ page }) => {
		await page.goto('/');

		/**
		 * Values are parsed to numbers rather than compared as strings. Browsers
		 * normalise CSS times on serialisation — `0ms` comes back as `0s` — so a
		 * string comparison tests the engine's serialiser, not the stylesheet.
		 */
		const tokens = await page.evaluate(() => {
			const style = getComputedStyle(document.documentElement);
			const ms = (name: string): number => {
				const raw = style.getPropertyValue(name).trim();
				if (raw.endsWith('ms')) return Number.parseFloat(raw);
				if (raw.endsWith('s')) return Number.parseFloat(raw) * 1000;
				return Number.NaN;
			};
			return {
				base: ms('--dur-base'),
				cinematic: ms('--dur-cinematic'),
				stagger: ms('--stagger-base'),
				distanceMd: style.getPropertyValue('--dist-md').trim()
			};
		});

		// 1ms rather than 0 for durations: a zero-duration transition never fires
		// `transitionend`, which silently breaks anything awaiting one.
		expect(tokens.base).toBeLessThanOrEqual(1);
		expect(tokens.cinematic).toBeLessThanOrEqual(1);
		// Stagger has no such constraint, so it genuinely goes to zero.
		expect(tokens.stagger).toBe(0);
		expect(Number.parseFloat(tokens.distanceMd)).toBe(0);
	});

	test('all content is fully visible immediately, with nothing left mid-reveal', async ({
		page
	}) => {
		for (const route of ROUTES) {
			await page.goto(route);
			await page.evaluate(() => document.fonts.ready);
			await page.waitForTimeout(300);

			const faded = await page.evaluate(() =>
				[...document.querySelectorAll('h1, h2, h3, p, li')]
					.filter((el) => {
						const opacity = Number(getComputedStyle(el).opacity);
						return opacity > 0 && opacity < 0.99;
					})
					.map((el) => `${el.tagName}: ${el.textContent?.trim().slice(0, 30)}`)
			);
			expect(faded, `${route} has partially-revealed content`).toEqual([]);
		}
	});

	test('nothing is translated away from its resting position', async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => document.fonts.ready);
		await page.waitForTimeout(400);

		const moved = await page.evaluate(() =>
			[...document.querySelectorAll('main *')]
				.filter((el) => {
					const transform = getComputedStyle(el).transform;
					if (transform === 'none') return false;
					// A matrix with a non-zero translate component. Scale-only
					// transforms (the aperture) are legitimate at rest.
					const match = /matrix\(([^)]+)\)/.exec(transform);
					if (!match?.[1]) return false;
					const parts = match[1].split(',').map((n) => Number(n.trim()));
					const tx = parts[4] ?? 0;
					const ty = parts[5] ?? 0;
					return Math.abs(tx) > 0.5 || Math.abs(ty) > 0.5;
				})
				.map((el) => `${el.tagName}.${el.className}`)
		);
		expect(moved).toEqual([]);
	});

	test('the hero headline is readable and keeps its accessible name', async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => document.fonts.ready);
		await page.waitForTimeout(400);

		const heading = page.getByRole('heading', { level: 1 });
		await expect(heading).toBeVisible();
		await expect(heading).toHaveText(/Software that expands what your business can become/);
	});

	test('navigation still works and does not animate the page away', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('link', { name: 'Work', exact: true }).first().click();
		await expect(page).toHaveURL(/\/work$/);

		// The transition returns early under reduced motion, so <main> must be at
		// full opacity with no residual transform the instant the route commits.
		const main = await page.evaluate(() => {
			const el = document.querySelector('main');
			if (!el) return null;
			const style = getComputedStyle(el);
			return { opacity: Number(style.opacity), transform: style.transform };
		});
		expect(main?.opacity).toBe(1);
		expect(main?.transform === 'none' || main?.transform === 'matrix(1, 0, 0, 1, 0, 0)').toBe(true);
	});

	test('the work filter still works', async ({ page }) => {
		await page.goto('/work');
		await page.getByRole('link', { name: 'Healthcare', exact: true }).click();
		await expect(page).toHaveURL(/industry=Healthcare/);
		await expect(page.getByText('1 project matching')).toBeVisible();
	});
});
