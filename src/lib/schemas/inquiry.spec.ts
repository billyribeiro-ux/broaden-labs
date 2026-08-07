import { describe, it, expect } from 'vitest';
import * as v from 'valibot';
import { inquirySchema, newsletterSchema } from './inquiry.ts';

/**
 * Schema behaviour. Brief §59, §93.
 *
 * These run against the SAME object the server validates with and the client
 * preflights with, so a passing test here is a statement about production
 * behaviour rather than about a copy.
 */

const valid = {
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
	signalSummary: '',
	consent: true,
	website2: '',
	elapsedMs: '4200'
};

function parse(overrides: Record<string, unknown> = {}) {
	return v.safeParse(inquirySchema, { ...valid, ...overrides });
}

function messagesFor(result: ReturnType<typeof parse>, path: string): string[] {
	if (result.success) return [];
	return result.issues
		.filter((issue) => issue.path?.[0]?.key === path)
		.map((issue) => issue.message);
}

describe('inquiry schema', () => {
	it('accepts a complete, well-formed submission', () => {
		const result = parse();
		expect(result.success).toBe(true);
	});

	it('trims whitespace rather than storing it', () => {
		const result = parse({ firstName: '  Ada  ', message: `  ${valid.message}  ` });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.output.firstName).toBe('Ada');
			expect(result.output.message).toBe(valid.message);
		}
	});

	it('rejects an empty required field with a human message', () => {
		const result = parse({ firstName: '   ' });
		expect(messagesFor(result, 'firstName')).toContain('First name is required.');
	});

	it('rejects a malformed email', () => {
		const result = parse({ email: 'ada@' });
		expect(messagesFor(result, 'email').length).toBeGreaterThan(0);
	});

	it('rejects a message too short to act on', () => {
		const result = parse({ message: 'hi' });
		expect(messagesFor(result, 'message')).toContain(
			'Tell us a little more — a sentence or two is enough to start.'
		);
	});

	it('caps the message so a body cannot become a storage problem', () => {
		const result = parse({ message: 'x'.repeat(4001) });
		expect(messagesFor(result, 'message').length).toBeGreaterThan(0);
	});

	/**
	 * The consent field is the one most likely to be got wrong. An unchecked
	 * checkbox sends NOTHING, so the field must be optional — but absent must
	 * still fail, because consent is required. Both halves are asserted.
	 */
	it('treats an unticked consent box as a failure, not as absent-and-fine', () => {
		const withoutConsent = { ...valid } as Record<string, unknown>;
		delete withoutConsent.consent;
		const result = v.safeParse(inquirySchema, withoutConsent);
		expect(result.success).toBe(false);
	});

	it('rejects consent explicitly set to false', () => {
		const result = parse({ consent: false });
		expect(result.success).toBe(false);
	});

	it('accepts an absent website but rejects a malformed one', () => {
		expect(parse({ website: '' }).success).toBe(true);
		expect(parse({ website: 'example.com' }).success).toBe(false);
	});

	it('rejects a project type outside the offered list', () => {
		const result = parse({ projectType: 'Blockchain for cats' });
		expect(messagesFor(result, 'projectType').length).toBeGreaterThan(0);
	});

	it('accepts a filled honeypot at the schema level — rejection is the handler’s job', () => {
		// The schema must NOT reject this: the handler needs to see the value so it
		// can record the event and return a plausible success to the bot. A schema
		// rejection would tell the bot exactly which field gave it away.
		const result = parse({ website2: 'http://spam.example' });
		expect(result.success).toBe(true);
	});
});

describe('newsletter schema', () => {
	it('accepts a valid address', () => {
		expect(v.safeParse(newsletterSchema, { email: 'ada@example.com', website2: '' }).success).toBe(
			true
		);
	});

	it('rejects a malformed address', () => {
		expect(v.safeParse(newsletterSchema, { email: 'nope', website2: '' }).success).toBe(false);
	});
});
