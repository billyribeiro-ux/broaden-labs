import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { sql } from 'drizzle-orm';
import { db } from '../index.ts';
import { projectInquiries, contactEvents, newsletterSubscribers } from '../schema.ts';
import { submitInquiry, subscribe, countRecentEvents, throttleConfig } from './inquiries.ts';

/**
 * Integration tests against the REAL local Postgres. Brief §93, §120.
 *
 * Not mocks. The throttle and duplicate rules are expressed in SQL with time
 * windows and indexes, and a mock of the query layer would assert that the
 * mock behaves as written rather than that Postgres does.
 *
 * Every test truncates first, so ordering between them cannot matter and a
 * failure is never a leftover from the previous run.
 */

async function truncate() {
	// CASCADE because contact_events references project_inquiries.
	await db.execute(
		sql`truncate table ${contactEvents}, ${projectInquiries}, ${newsletterSubscribers} restart identity cascade`
	);
}

const baseInquiry = {
	firstName: 'Ada',
	lastName: 'Lovelace',
	email: 'ada@example.com',
	company: 'Analytical Engines',
	website: 'https://example.com',
	projectType: 'Real-time system',
	estimatedBudget: '$50k–$100k',
	timeline: '1–3 months',
	message: 'We have a trading surface that reloads on every reconnect and it is costing us.',
	referralSource: 'Search',
	signalSummary: null,
	consent: true
};

const ctx = { ipHash: 'test-hash-aaaa', requestId: 'test-request' };

beforeEach(truncate);
afterAll(truncate);

describe('submitInquiry', () => {
	it('persists an inquiry and returns the created row', async () => {
		const outcome = await submitInquiry(baseInquiry, ctx);

		expect(outcome.kind).toBe('created');
		if (outcome.kind !== 'created') return;

		expect(outcome.inquiry.email).toBe('ada@example.com');
		// Server-generated: a UUID, not a sequence, so submission volume does not
		// leak to anyone who submits twice.
		expect(outcome.inquiry.id).toMatch(/^[0-9a-f-]{36}$/);
		expect(outcome.inquiry.status).toBe('new');
		expect(outcome.inquiry.createdAt).toBeInstanceOf(Date);
	});

	it('records an audit event that carries a hash and no raw address', async () => {
		await submitInquiry(baseInquiry, ctx);

		const events = await db.select().from(contactEvents);
		expect(events).toHaveLength(1);
		expect(events[0]?.kind).toBe('inquiry_submitted');
		expect(events[0]?.ipHash).toBe('test-hash-aaaa');
		// The audit row must not become a second copy of the inquiry.
		expect(Object.keys(events[0] ?? {})).not.toContain('message');
		expect(Object.keys(events[0] ?? {})).not.toContain('email');
	});

	it('refuses an identical resubmission inside the duplicate window', async () => {
		const first = await submitInquiry(baseInquiry, ctx);
		expect(first.kind).toBe('created');

		const second = await submitInquiry(baseInquiry, ctx);
		expect(second.kind).toBe('duplicate');

		const rows = await db.select().from(projectInquiries);
		expect(rows).toHaveLength(1);
	});

	it('allows the same person to enquire again about something different', async () => {
		await submitInquiry(baseInquiry, ctx);

		// Same email, different message — a real second enquiry, which a unique
		// constraint on email would have wrongly rejected.
		const second = await submitInquiry(
			{ ...baseInquiry, message: 'Separately, we also need help with the billing architecture.' },
			ctx
		);

		expect(second.kind).toBe('created');
		expect(await db.select().from(projectInquiries)).toHaveLength(2);
	});

	it('throttles once the per-address limit is reached', async () => {
		for (let index = 0; index < throttleConfig.max; index += 1) {
			const outcome = await submitInquiry(
				{ ...baseInquiry, message: `Distinct enquiry number ${index} about a real problem.` },
				ctx
			);
			expect(outcome.kind).toBe('created');
		}

		const blocked = await submitInquiry(
			{ ...baseInquiry, message: 'One more distinct enquiry that should not land.' },
			ctx
		);
		expect(blocked.kind).toBe('throttled');

		// The rejection is itself recorded, so abuse is visible in the audit trail.
		const events = await db.select().from(contactEvents);
		expect(events.some((event) => event.kind === 'inquiry_rejected_throttle')).toBe(true);
		expect(await db.select().from(projectInquiries)).toHaveLength(throttleConfig.max);
	});

	it('throttles per address, so one abuser cannot block everyone', async () => {
		for (let index = 0; index < throttleConfig.max; index += 1) {
			await submitInquiry(
				{ ...baseInquiry, message: `Enquiry ${index} from the first address.` },
				ctx
			);
		}
		expect((await submitInquiry({ ...baseInquiry, message: 'Blocked one.' }, ctx)).kind).toBe(
			'throttled'
		);

		// A different client address is unaffected.
		const other = await submitInquiry(
			{ ...baseInquiry, email: 'grace@example.com', message: 'A different person, unaffected.' },
			{ ipHash: 'test-hash-bbbb', requestId: 'other-request' }
		);
		expect(other.kind).toBe('created');
	});

	it('counts only events inside the window', async () => {
		await submitInquiry(baseInquiry, ctx);

		expect(await countRecentEvents(ctx.ipHash, throttleConfig.windowMs)).toBe(1);

		/**
		 * A NEGATIVE window, not a zero-width one. Zero width puts the boundary at
		 * "now as Node sees it" while the row's timestamp came from Postgres's
		 * `now()`, so a few milliseconds of clock skew between the two decides the
		 * result — it passed by luck and then failed. A window that starts in the
		 * future cannot contain a past row under any skew, which is what actually
		 * proves the bound is applied rather than the count being unconditional.
		 */
		expect(await countRecentEvents(ctx.ipHash, -60_000)).toBe(0);

		expect(await countRecentEvents('a-hash-that-never-submitted', throttleConfig.windowMs)).toBe(0);
	});
});

describe('subscribe', () => {
	it('stores a new subscriber', async () => {
		await subscribe('ada@example.com');
		const rows = await db.select().from(newsletterSubscribers);
		expect(rows).toHaveLength(1);
		expect(rows[0]?.status).toBe('pending');
	});

	it('is idempotent, so subscribing twice is not an error and not a duplicate', async () => {
		await subscribe('ada@example.com');
		await subscribe('ada@example.com');

		const rows = await db.select().from(newsletterSubscribers);
		expect(rows).toHaveLength(1);
	});
});
