import { test, expect, type Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import { resetInquiryTables } from '#lib/server/testing/reset-db';

/**
 * The inquiry workflow end to end. Brief §58, §59, §93 (scenarios 8–10).
 *
 * These run against the real production build AND the real local database, so a
 * pass means a row landed in Postgres — not that a mock was called.
 *
 * Run SERIALLY with a database reset between each. Playwright drives a real
 * browser against a real server, so every test submits from 127.0.0.1 and
 * shares one throttle bucket — in parallel, the third submission of the run is
 * throttled and the duplicate test fails for a reason that has nothing to do
 * with duplicates. Resetting keeps the shipped throttle configuration intact
 * rather than weakening it for the benefit of the tests.
 */

const WCAG_22_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

function uniqueEmail(label: string): string {
	return `e2e-${label}-${Date.now()}@example.com`;
}

async function fillValidInquiry(page: Page, email: string, message?: string) {
	await page.getByLabel('First name').fill('Ada');
	await page.getByLabel('Last name').fill('Lovelace');
	await page.getByLabel('Work email').fill(email);
	await page.getByLabel('Company').fill('Analytical Engines');
	await page.getByLabel('What are you looking to build?').selectOption('Real-time system');
	await page.getByLabel('Estimated investment').selectOption('$50k–$100k');
	await page.getByLabel('Desired timeline').selectOption('1–3 months');
	await page
		.getByLabel('Tell us about the project')
		.fill(message ?? `A genuine description of a real problem, written at ${Date.now()}.`);
	await page.getByLabel(/happy for Broaden Labs to store/).check();
}

test.describe.configure({ mode: 'serial' });

test.beforeEach(async () => {
	await resetInquiryTables();
});

test.describe('inquiry form', () => {
	test('is accessible', async ({ page }) => {
		await page.goto('/start-a-project');
		const { violations } = await new AxeBuilder({ page }).withTags(WCAG_22_AA).analyze();
		expect(violations.map((v) => v.id)).toEqual([]);
	});

	test('rejects invalid data before it reaches the server', async ({ page }) => {
		await page.goto('/start-a-project');

		await page.getByLabel('Work email').fill('not-an-email');
		await page.getByRole('button', { name: 'Start the conversation' }).click();

		// Still on the form; nothing was submitted.
		await expect(page.getByRole('button', { name: 'Start the conversation' })).toBeVisible();
		await expect(page.getByText('Message received.')).toBeHidden();

		// The error is associated with the control, not merely displayed near it.
		const email = page.getByLabel('Work email');
		await expect(email).toHaveAttribute('aria-invalid', 'true');

		const describedBy = await email.getAttribute('aria-describedby');
		expect(describedBy, 'the invalid field must point at its error message').toBeTruthy();
		await expect(page.locator(`#${describedBy?.split(' ').pop()}`)).not.toBeEmpty();
	});

	test('requires consent, and says so', async ({ page }) => {
		await page.goto('/start-a-project');
		await fillValidInquiry(page, uniqueEmail('consent'));
		await page.getByLabel(/happy for Broaden Labs to store/).uncheck();

		await page.getByRole('button', { name: 'Start the conversation' }).click();

		await expect(page.getByText('Please confirm you are happy for us to reply.')).toBeVisible();
		await expect(page.getByText('Message received.')).toBeHidden();
	});

	test('accepts a valid submission and shows the success state', async ({ page }) => {
		await page.goto('/start-a-project');
		await fillValidInquiry(page, uniqueEmail('valid'));

		await page.getByRole('button', { name: 'Start the conversation' }).click();

		await expect(page.getByText('Message received.')).toBeVisible();
		await expect(page.getByText(/We'll review the details/)).toBeVisible();
		// A reference the visitor can quote back.
		await expect(page.locator('.reference code')).not.toBeEmpty();

		// The form is REPLACED, not left underneath — there is no way to read the
		// page as "submitted, and also here is the form again".
		await expect(page.getByRole('button', { name: 'Start the conversation' })).toBeHidden();
	});

	test('refuses an identical resubmission', async ({ page }) => {
		const email = uniqueEmail('dupe');
		const message = `An identical message submitted twice, ${Date.now()}.`;

		await page.goto('/start-a-project');
		await fillValidInquiry(page, email, message);
		await page.getByRole('button', { name: 'Start the conversation' }).click();
		await expect(page.getByText('Message received.')).toBeVisible();

		await page.goto('/start-a-project');
		await fillValidInquiry(page, email, message);
		await page.getByRole('button', { name: 'Start the conversation' }).click();

		await expect(page.getByText('We already have this one.')).toBeVisible();
	});

	test('a filled honeypot is discarded without telling the bot', async ({ page }) => {
		await page.goto('/start-a-project');
		await fillValidInquiry(page, uniqueEmail('honeypot'));

		// The field is off-screen and aria-hidden, so a human never reaches it.
		// Filling it directly is what a naive scraper does.
		await page.locator('#website2').fill('http://spam.example');

		await page.getByRole('button', { name: 'Start the conversation' }).click();

		// A plausible success — telling a bot it was detected is free information
		// for whoever is tuning it.
		await expect(page.getByText('Message received.')).toBeVisible();
	});

	test('the honeypot is hidden from keyboard and assistive technology', async ({ page }) => {
		await page.goto('/start-a-project');

		const honeypot = page.locator('#website2');
		await expect(honeypot).toHaveAttribute('tabindex', '-1');
		await expect(honeypot).toHaveAttribute('autocomplete', 'off');

		const hiddenFromAt = await honeypot.evaluate((el) =>
			Boolean(el.closest('[aria-hidden="true"]'))
		);
		expect(hiddenFromAt).toBe(true);
	});
});
