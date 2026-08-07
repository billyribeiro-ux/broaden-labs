import * as v from 'valibot';

/**
 * Inquiry validation. Brief §58, §59, §90.
 *
 * ONE schema, used in two places: SvelteKit's `form()` accepts it directly
 * because valibot implements Standard Schema v1 (Kit duck-types `'~standard' in
 * validator`), and the same object is passed to `form.preflight()` on the client.
 * Two schemas would drift, and the one that drifted would be the client's — so
 * the server would start rejecting things the form said were fine.
 *
 * Note every boolean is `v.optional(..., false)`. An unchecked checkbox sends
 * NOTHING, so a required boolean can never be satisfied by a real form. Kit
 * catches this at the type level: a non-optional boolean in a form schema turns
 * the parameter type into a string literal error message, and `tsc` fails with
 * an explanation rather than the form silently breaking at runtime.
 */

export const PROJECT_TYPES = [
	'New digital product',
	'Existing product redesign',
	'Custom web application',
	'SaaS platform',
	'Real-time system',
	'AI / automation',
	'Platform modernization',
	'Product design system',
	'Technical consulting',
	'Not sure yet'
] as const;

export const BUDGET_RANGES = [
	'Under $25k',
	'$25k–$50k',
	'$50k–$100k',
	'$100k–$250k',
	'$250k+',
	'Not sure yet'
] as const;

export const TIMELINES = [
	'As soon as practical',
	'1–3 months',
	'3–6 months',
	'6+ months',
	'Exploring'
] as const;

export const REFERRAL_SOURCES = [
	'Search',
	'A recommendation',
	'Social',
	'An event or talk',
	'Worked with you before',
	'Other'
] as const;

/** Length ceilings exist so a malicious body cannot become a storage problem. */
const MAX = {
	name: 80,
	email: 254, // RFC 5321 maximum
	company: 120,
	website: 300,
	message: 4000,
	summary: 1200
} as const;

const trimmedText = (max: number, label: string) =>
	v.pipe(
		v.string(),
		v.trim(),
		v.minLength(1, `${label} is required.`),
		v.maxLength(max, `${label} must be ${max} characters or fewer.`)
	);

const optionalText = (max: number, label: string) =>
	v.optional(
		v.pipe(v.string(), v.trim(), v.maxLength(max, `${label} must be ${max} characters or fewer.`)),
		''
	);

export const inquirySchema = v.object({
	firstName: trimmedText(MAX.name, 'First name'),
	lastName: trimmedText(MAX.name, 'Last name'),

	email: v.pipe(
		v.string(),
		v.trim(),
		v.minLength(1, 'A work email is required so we can reply.'),
		v.maxLength(MAX.email, 'That email address is too long.'),
		// valibot's own email check rather than a hand-written regex. Email
		// grammar is not something to reimplement in a template literal.
		v.email('That does not look like an email address we could reply to.')
	),

	company: optionalText(MAX.company, 'Company'),

	website: v.optional(
		v.union(
			[
				v.literal(''),
				v.pipe(
					v.string(),
					v.trim(),
					v.maxLength(MAX.website, 'That URL is too long.'),
					v.url('Enter a full URL, including https://')
				)
			],
			'Enter a full URL, including https://'
		),
		''
	),

	projectType: v.picklist(PROJECT_TYPES, 'Choose what you are looking to build.'),
	estimatedBudget: v.picklist(BUDGET_RANGES, 'Choose an approximate investment range.'),
	timeline: v.picklist(TIMELINES, 'Choose a rough timeline.'),

	message: v.pipe(
		v.string(),
		v.trim(),
		v.minLength(20, 'Tell us a little more — a sentence or two is enough to start.'),
		v.maxLength(MAX.message, `Please keep this under ${MAX.message} characters.`)
	),

	referralSource: v.optional(v.union([v.literal(''), v.picklist(REFERRAL_SOURCES)]), ''),

	signalSummary: optionalText(MAX.summary, 'Project summary'),

	/**
	 * Consent must be TRUE, but the field must be OPTIONAL, because an unchecked
	 * checkbox is absent from the submission rather than false. `literal(true)`
	 * on an optional field expresses exactly that: absent or false both fail with
	 * the message, and only an actual tick passes.
	 */
	consent: v.optional(
		v.literal(true, 'Please confirm you are happy for us to reply.'),
		false as unknown as true
	),

	/**
	 * Honeypot. A field no human sees, so any value at all means a bot filled the
	 * form blind. Named plausibly — `website2`, not `honeypot` — because the
	 * naive scrapers this catches read field names.
	 */
	website2: v.optional(v.string(), ''),

	/**
	 * Milliseconds between render and submit, set by the client. Treated as a
	 * SIGNAL, never as proof: it is attacker-controlled, so an implausible value
	 * raises suspicion but the server's own rate limit is what actually holds.
	 */
	elapsedMs: v.optional(v.string(), '')
});

export type InquiryInput = v.InferInput<typeof inquirySchema>;
export type InquiryOutput = v.InferOutput<typeof inquirySchema>;

export const newsletterSchema = v.object({
	email: v.pipe(
		v.string(),
		v.trim(),
		v.minLength(1, 'Enter an email address.'),
		v.maxLength(MAX.email, 'That email address is too long.'),
		v.email('That does not look like an email address.')
	),
	website2: v.optional(v.string(), '')
});

export type NewsletterInput = v.InferInput<typeof newsletterSchema>;
