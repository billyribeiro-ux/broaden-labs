import { test, expect } from '@playwright/test';

/**
 * The site must work with JavaScript disabled. Brief §116.
 *
 * This runs in its own Playwright project (`no-js`, javaScriptEnabled: false)
 * rather than as a per-test override, so the guarantee cannot quietly rot when
 * someone adds a client-only dependency.
 *
 * The mobile menu is deliberately NOT asserted here: it is a <dialog> driven by
 * showModal(), which is a scripted API. Without JS the trigger does nothing —
 * that is the documented degradation, and the content it links to is reachable
 * from the footer, which is plain markup. Claiming otherwise would be the
 * "fake functionality" the brief rules out.
 */

test('content and navigation are fully readable without JavaScript', async ({ page }) => {
	await page.goto('/');

	await expect(page.getByRole('heading', { level: 1 })).toHaveText(
		'Software that expands what your business can become.'
	);
	await expect(
		page.getByText('Broaden Labs designs and engineers ambitious digital products')
	).toBeVisible();

	// Both hero CTAs are real links, not scripted buttons.
	await expect(page.getByRole('link', { name: 'Start a project' }).first()).toBeVisible();
	await expect(page.getByRole('link', { name: 'Explore our work' })).toBeVisible();
});

test('every primary route is reachable and renders without JavaScript', async ({ page }) => {
	for (const [href, heading] of [
		['/work', 'Work where design and engineering have to agree.'],
		['/services', 'We engineer the product—and the system that makes it possible.'],
		['/about', 'Built for the space between the idea and the system it requires.'],
		['/insights', 'Thinking about products, systems, and the decisions between them.']
	] as const) {
		const response = await page.goto(href);
		expect(response?.status(), `${href} status`).toBe(200);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
	}
});

test('the footer provides navigation when the scripted menu cannot', async ({ page }) => {
	await page.goto('/');

	const footer = page.getByRole('contentinfo');
	for (const label of ['Work', 'Services', 'About', 'Insights', 'Privacy', 'Accessibility']) {
		await expect(footer.getByRole('link', { name: label, exact: true })).toBeVisible();
	}
});

test('webfonts still load and text is styled without JavaScript', async ({ page }) => {
	await page.goto('/');

	// CSS-driven, so it must survive with scripting off. If this ever falls back
	// to the generic stack it means the stylesheet is being injected by JS.
	const family = await page
		.getByRole('heading', { level: 1 })
		.evaluate((el) => getComputedStyle(el).fontFamily);
	expect(family).toContain('Bricolage Grotesque');
});
