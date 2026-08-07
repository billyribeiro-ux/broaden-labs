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

function required(name: string) {
	return (value: string | undefined): string => {
		if (value === undefined || value.trim() === '') {
			throw new Error(`${name} is required but was empty or unset.`);
		}
		return value;
	};
}

function optional(value: string | undefined): string | undefined {
	return value === undefined || value.trim() === '' ? undefined : value;
}

function postgresUrl(value: string | undefined): string {
	const url = required('DATABASE_URL')(value);
	if (!/^postgres(ql)?:\/\//.test(url)) {
		throw new Error(
			`DATABASE_URL must start with postgres:// or postgresql:// (got "${url.slice(0, 12)}…").`
		);
	}
	return url;
}

function absoluteOrigin(value: string | undefined): string {
	const raw = required('PUBLIC_ORIGIN')(value);
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

function siteEnv(value: string | undefined): SiteEnv {
	const raw = value ?? 'development';
	if (!SITE_ENVS.includes(raw as SiteEnv)) {
		throw new Error(`PUBLIC_SITE_ENV must be one of ${SITE_ENVS.join(' | ')} (got "${raw}").`);
	}
	return raw as SiteEnv;
}

function contactEmail(value: string | undefined): string {
	const raw = required('PUBLIC_CONTACT_EMAIL')(value);
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
