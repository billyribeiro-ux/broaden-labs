/**
 * Facts the legal pages depend on.
 *
 * These live in ONE place because three documents assert them and a policy that
 * contradicts itself is worse than no policy. Everything here is either
 * verifiable from the codebase or must be confirmed by the owner — nothing is
 * invented to make a page look finished.
 *
 * ⚠️ BEFORE LAUNCH, confirm two values with counsel:
 *
 *   1. `ENTITY` — the registered legal name, if Broaden Labs trades under one.
 *      Currently the trading name, which is accurate but not a company number.
 *   2. `JURISDICTION` — narrowed to a state. "United States" is inferred from
 *      hard evidence (the .com registration, the Vercel account, and the
 *      database region `aws-us-east-1`), NOT guessed, but a governing-law clause
 *      is stronger when it names a state.
 *
 * Everything else below was read out of the code it describes:
 * `src/lib/server/db/schema.ts` for the fields, `hash.ts` for the IP handling,
 * and a search of `src/` that found no cookie, analytics or third-party script.
 */

/** Trading name. See the warning above. */
export const ENTITY = 'Broaden Labs';

/** See the warning above — narrow this to a state before launch. */
export const JURISDICTION = 'the United States';

/**
 * The date these documents last changed in a way that affects their meaning.
 * Bump it when the substance changes, not when a typo is fixed.
 */
export const LAST_UPDATED = '2026-08-08';

/** Rendered as "8 August 2026" — written out, because 08/08 is ambiguous. */
export const LAST_UPDATED_LABEL = '8 August 2026';

/**
 * Sub-processors. Both are read from the deployment, not assumed: the adapter is
 * `@sveltejs/adapter-vercel` and the database is the Neon instance provisioned
 * for this project in `aws-us-east-1`.
 */
export const PROCESSORS = [
	{
		name: 'Vercel Inc.',
		role: 'Website hosting and content delivery',
		region: 'United States'
	},
	{
		name: 'Neon Inc.',
		role: 'Managed PostgreSQL database storing form submissions',
		region: 'United States (AWS us-east-1)'
	}
] as const;

/**
 * Every field the inquiry form persists, taken from `project_inquiries` in
 * src/lib/server/db/schema.ts. If a column is added there, it belongs here too —
 * a privacy policy that under-declares is the failure mode that matters.
 */
export const INQUIRY_FIELDS = [
	'First and last name',
	'Email address',
	'Company name and website, if you provide them',
	'Project type, estimated budget and timeline',
	'Your message, and the project summary if you use the planner',
	'How you heard about us, if you tell us',
	'Your consent to be contacted'
] as const;

/**
 * Data collected without being typed in. Deliberately explicit about the hash:
 * `hashClientAddress` in src/lib/server/db/hash.ts derives a salted digest and
 * the raw address is never persisted, which is a meaningfully stronger claim
 * than "we collect IP addresses" and should be stated as such.
 */
export const TECHNICAL_FIELDS = [
	'A one-way salted hash of your IP address — never the address itself — used only to rate-limit abuse',
	'How long the form took to complete, used to detect automated submissions',
	'A random request identifier, used to correlate server logs'
] as const;

/** Retention. A policy choice, stated plainly so it can be changed knowingly. */
export const RETENTION_MONTHS = 24;
