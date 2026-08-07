import { test, expect } from '@playwright/test';
import { resetInquiryTables } from '#lib/server/testing/reset-db';

/**
 * The inquiry form must work with JavaScript disabled. Brief §116, §126.
 *
 * This is the single most load-bearing test in the suite. It is the reason the
 * workflow uses `form()` rather than `command()`: a remote form posts to the
 * current page URL and is only progressively ENHANCED when JavaScript loads,
 * whereas a command has no element, no action, and no fallback at all.
 *
 * A pass here means a real row reached Postgres from a browser with scripting
 * switched off — no fetch, no hydration, no client-side validation.
 */

/**
 * Scripting is disabled at FILE level rather than by project, because these
 * specs live in the serial `forms` project alongside the enhanced-path tests —
 * they share a database and a throttle bucket, so they must not run in a
 * different project in parallel with them.
 */
test.use({ javaScriptEnabled: false });

test.describe.configure({ mode: 'serial' });

test.beforeEach(async () => {
	await resetInquiryTables();
});

test('submits and persists with JavaScript disabled', async ({ page }) => {
	await page.goto('/start-a-project');

	// Every control is a real form control, reachable by label, with no script
	// having run to attach anything.
	await page.getByLabel('First name').fill('Grace');
	await page.getByLabel('Last name').fill('Hopper');
	await page.getByLabel('Work email').fill(`nojs-${Date.now()}@example.com`);
	await page.getByLabel('What are you looking to build?').selectOption('Custom web application');
	await page.getByLabel('Estimated investment').selectOption('$100k–$250k');
	await page.getByLabel('Desired timeline').selectOption('3–6 months');
	await page
		.getByLabel('Tell us about the project')
		.fill('Submitted from a browser with scripting disabled, to prove the fallback path works.');
	await page.getByLabel(/happy for Broaden Labs to store/).check();

	await page.getByRole('button', { name: 'Start the conversation' }).click();

	// A full page navigation, not a fetch — and the success state rendered by the
	// server on the other side of it.
	await expect(page.getByText('Message received.')).toBeVisible();
	await expect(page.locator('.reference code')).not.toBeEmpty();
});

test('server-side validation rejects bad input with JavaScript disabled', async ({ page }) => {
	await page.goto('/start-a-project');

	// With scripting off there is no preflight, so this exercises the SERVER
	// schema — the same object, running in the remote function.
	await page.getByLabel('First name').fill('Grace');
	await page.getByLabel('Last name').fill('Hopper');
	await page.getByLabel('Work email').fill('definitely-not-an-email');
	await page.getByLabel('What are you looking to build?').selectOption('Custom web application');
	await page.getByLabel('Estimated investment').selectOption('$100k–$250k');
	await page.getByLabel('Desired timeline').selectOption('3–6 months');
	await page.getByLabel('Tell us about the project').fill('A message long enough to be accepted.');
	await page.getByLabel(/happy for Broaden Labs to store/).check();

	await page.getByRole('button', { name: 'Start the conversation' }).click();

	await expect(page.getByText('Message received.')).toBeHidden();
	await expect(page.getByLabel('Work email')).toHaveAttribute('aria-invalid', 'true');
});

test('an unticked consent box is refused by the server, not just the client', async ({ page }) => {
	await page.goto('/start-a-project');

	await page.getByLabel('First name').fill('Grace');
	await page.getByLabel('Last name').fill('Hopper');
	await page.getByLabel('Work email').fill(`nojs-consent-${Date.now()}@example.com`);
	await page.getByLabel('What are you looking to build?').selectOption('Custom web application');
	await page.getByLabel('Estimated investment').selectOption('$100k–$250k');
	await page.getByLabel('Desired timeline').selectOption('3–6 months');
	await page.getByLabel('Tell us about the project').fill('A message long enough to be accepted.');
	// Consent deliberately left unticked — which sends NOTHING, not `false`.

	await page.getByRole('button', { name: 'Start the conversation' }).click();

	await expect(page.getByText('Please confirm you are happy for us to reply.')).toBeVisible();
	await expect(page.getByText('Message received.')).toBeHidden();
});
