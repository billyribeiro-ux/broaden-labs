import { defineEnvVars } from '@sveltejs/kit/env';

/**
 * Validators are plain functions rather than valibot schemas on purpose.
 * `EnvVarConfig.schema` accepts `StandardSchemaV1<string | undefined, T>`, and a
 * valibot schema built with `v.string()` infers its input as `string`, not
 * `string | undefined` — so it does not fit that contravariant position. A
 * function validator is first-class here (Kit normalises it to a Standard Schema
 * itself) and lets us word the failure message ourselves.
 *
 * Async validators are rejected outright by Kit, so every function below is sync.
 * A validator that returns `undefined` describes an optional variable.
 */

/**
 * There is deliberately no `required()` helper any more.
 *
 * Every variable here now either has a production default or is genuinely
 * optional, because a validator that throws runs during PRERENDERING and takes
 * the whole build down. That turned three unset dashboard variables into a
 * failed Vercel deployment for a site that is almost entirely static and needs
 * none of them to render. Where a value really is needed, the feature that needs
 * it refuses at the point of use and says why — see inquiry.remote.ts.
 */
function optional(value: string | undefined): string | undefined {
	return value === undefined || value.trim() === '' ? undefined : value;
}

/**
 * OPTIONAL at build time, validated when present.
 *
 * Requiring it meant `vite build` failed on Vercel with "DATABASE_URL is
 * required but was empty or unset" before a database had been provisioned —
 * and it fails during PRERENDERING, which is the part of the build that needs
 * no database at all. All but one route here is static marketing content.
 *
 * So the site builds and deploys without a database, and the one feature that
 * needs one — the inquiry form — fails loudly at the point of use instead. See
 * src/lib/server/db/index.ts. A missing database now breaks the form rather
 * than the deployment, which is the correct blast radius.
 */
function postgresUrl(value: string | undefined): string | undefined {
	if (!value?.trim()) return undefined;
	if (!/^postgres(ql)?:\/\//.test(value)) {
		throw new Error(
			`DATABASE_URL must start with postgres:// or postgresql:// (got "${value.slice(0, 12)}…").`
		);
	}
	return value;
}

/**
 * The canonical production values.
 *
 * These are DEFAULTS rather than required inputs because they are neither
 * secret nor deployment-specific: the canonical origin is production even on a
 * preview deploy (see below), and the contact address is printed on the page.
 * Requiring them meant a fresh Vercel project failed its first build with
 * "PUBLIC_ORIGIN is required but was empty or unset" — friction with no
 * security benefit, and a failure mode that recurs on every new environment.
 *
 * They remain overridable; what changed is that forgetting is no longer fatal.
 */
const PRODUCTION_ORIGIN = 'https://broadenlabs.com';
const PRODUCTION_CONTACT = 'hello@broadenlabs.com';

function absoluteOrigin(value: string | undefined): string {
	const raw = value?.trim() ? value : PRODUCTION_ORIGIN;
	let parsed: URL;
	try {
		parsed = new URL(raw);
	} catch {
		throw new Error(`PUBLIC_ORIGIN must be an absolute URL (got "${raw}").`);
	}
	if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost') {
		throw new Error(`PUBLIC_ORIGIN must use https outside localhost (got "${raw}").`);
	}
	// A trailing slash here would produce "https://site.com//work" in every canonical
	// URL and sitemap entry, so it is normalised away once, at the source.
	return parsed.origin;
}

const SITE_ENVS = ['development', 'preview', 'production'] as const;
type SiteEnv = (typeof SITE_ENVS)[number];

/**
 * Falls back to Vercel's own VERCEL_ENV, which the platform sets automatically
 * to production | preview | development.
 *
 * This is a safety fix, not a convenience. The demo-content gate fires when the
 * target is `production`, and PUBLIC_SITE_ENV is not set on a fresh Vercel
 * project — so a production deploy would have defaulted to `development` and
 * shipped thirteen fictional case studies, testimonials and team profiles as
 * real client proof. The gate now arms itself from the platform rather than
 * relying on someone remembering to add a variable.
 */
function siteEnv(value: string | undefined): SiteEnv {
	const raw = value?.trim() || process.env.VERCEL_ENV || 'development';
	if (!SITE_ENVS.includes(raw as SiteEnv)) {
		throw new Error(`PUBLIC_SITE_ENV must be one of ${SITE_ENVS.join(' | ')} (got "${raw}").`);
	}
	return raw as SiteEnv;
}

function contactEmail(value: string | undefined): string {
	const raw = value?.trim() ? value : PRODUCTION_CONTACT;
	if (!raw.includes('@')) {
		throw new Error(`PUBLIC_CONTACT_EMAIL must be an email address (got "${raw}").`);
	}
	return raw;
}

export const variables = defineEnvVars({
	DATABASE_URL: {
		description: 'PostgreSQL connection string. Local Postgres in dev, Neon in production.',
		schema: postgresUrl
	},

	/**
	 * Static on purpose: this is the canonical production origin, and canonical URLs,
	 * sitemap entries and OG tags must point at production even when rendered from a
	 * Vercel preview deployment. Preview URLs must never be canonicalised.
	 */
	PUBLIC_ORIGIN: {
		description: 'Canonical absolute origin, e.g. https://broadenlabs.com. No trailing slash.',
		public: true,
		static: true,
		schema: absoluteOrigin
	},

	PUBLIC_SITE_ENV: {
		description: 'Which deployment this is: development | preview | production.',
		public: true,
		static: true,
		schema: siteEnv
	},

	PUBLIC_CONTACT_EMAIL: {
		description: 'Public contact address shown in the closing CTA and footer.',
		public: true,
		static: true,
		schema: contactEmail
	},

	PUBLIC_ANALYTICS_ID: {
		description: 'Optional analytics site identifier. Absent means analytics stays off.',
		public: true,
		static: true,
		schema: optional
	},

	RESEND_API_KEY: {
		description:
			'Optional email provider key for inquiry notifications. Absent means no email is sent.',
		schema: optional
	},

	SENTRY_DSN: {
		description: 'Optional error-reporting DSN. Absent means errors are logged to stdout only.',
		schema: optional
	}
});
