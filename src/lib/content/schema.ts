import type { CredentialKind } from './safety.ts';

/**
 * The content model.
 *
 * Two categories of content exist and the type system keeps them apart:
 *
 *   AUTHORED — services, principles, process, values. This is Broaden's own
 *   voice describing what Broaden does. It is true by construction and carries
 *   no isDemo flag.
 *
 *   CREDENTIAL — case studies, testimonials, metrics, clients, team, awards.
 *   Every one of these is a factual claim about a third party. All of it is
 *   currently fictional, every record carries `isDemo: true`, and the Vite
 *   content-safety plugin refuses to build for production while any remains.
 *
 * The split is why `DemoRecord` is a required supertype of the credential types
 * and absent from the authored ones: you cannot add a testimonial without
 * declaring whether it is real.
 */

export interface Authored {
	readonly slug: string;
	readonly title: string;
}

export interface Credential {
	readonly isDemo: boolean;
	readonly kind: CredentialKind;
	readonly id: string;
}

/* ── Services (authored) ─────────────────────────────────────────────────── */

export interface Service extends Authored {
	readonly number: string;
	readonly name: string;
	/** Card headline on the homepage. */
	readonly cardHeadline: string;
	readonly cardCopy: string;
	readonly capabilities: readonly string[];
	/** Detail-page hero, distinct from the card headline. */
	readonly heroHeadline: string;
	readonly heroIntro: readonly string[];
	readonly sectionHeadline: string;
	readonly sectionCopy: readonly string[];
	readonly fitsWhen: readonly string[];
	readonly ctaLabel: string;
	readonly metaTitle: string;
	readonly metaDescription: string;
	/** Drives the per-service art-direction motif. Brief §40. */
	readonly motif: 'lattice' | 'strata' | 'pulse' | 'gradientless-flow' | 'substrate' | 'systemgrid';
}

/* ── Case studies (credential) ───────────────────────────────────────────── */

export type Industry =
	'FinTech' | 'Healthcare' | 'SaaS' | 'Commerce' | 'Operations' | 'Emerging Tech';

export type Capability =
	'Product Engineering' | 'Real-Time' | 'AI' | 'Platform Modernization' | 'Product Design';

export interface Metric {
	readonly value: string;
	readonly label: string;
}

export interface CaseStudy extends Credential {
	readonly slug: string;
	readonly client: string;
	readonly industry: Industry;
	readonly capabilities: readonly Capability[];
	readonly category: string;
	readonly project: string;
	readonly headline: string;
	readonly summary: readonly string[];
	readonly challenge: readonly string[];
	readonly approach: readonly string[];
	readonly outcome: readonly string[];
	readonly metrics: readonly Metric[];
	readonly services: readonly string[];
	readonly year: string;
	/** Which fixture interface component the case study renders. */
	readonly surface:
		| 'command-center'
		| 'operational-queue'
		| 'purchasing-flow'
		| 'spatial-grid'
		| 'workflow-console'
		| 'control-surface';
}

/* ── Testimonials (credential) ───────────────────────────────────────────── */

export interface Testimonial extends Credential {
	readonly quote: string;
	readonly author: string;
	readonly role: string;
	readonly company: string;
}

/* ── Team (credential) ───────────────────────────────────────────────────── */

export interface TeamMember extends Credential {
	readonly name: string;
	readonly role: string;
	readonly bio: string;
	readonly expertise: readonly string[];
}

/* ── Insights (authored — Broaden's own writing) ─────────────────────────── */

export type InsightCategory =
	'Engineering' | 'Product' | 'Design' | 'Real-Time' | 'AI' | 'Architecture';

export interface Insight extends Authored {
	readonly category: InsightCategory;
	readonly dek: string;
	readonly excerpt: string;
	readonly author: string;
	/** ISO 8601. Rendered through Intl so the format is not hand-built. */
	readonly published: string;
	readonly readingMinutes: number;
	readonly body: readonly ArticleBlock[];
	readonly related: readonly string[];
}

export type ArticleBlock =
	| { readonly type: 'p'; readonly text: string }
	| { readonly type: 'h2'; readonly text: string }
	| { readonly type: 'callout'; readonly text: string }
	| { readonly type: 'list'; readonly items: readonly string[] }
	| { readonly type: 'code'; readonly language: string; readonly code: string }
	| {
			readonly type: 'table';
			readonly caption: string;
			readonly head: readonly string[];
			readonly rows: readonly (readonly string[])[];
	  };

/* ── Homepage narrative (authored) ───────────────────────────────────────── */

export interface Principle {
	readonly number: string;
	readonly title: string;
	readonly body: readonly string[];
}

export interface ProcessStep {
	readonly number: string;
	readonly name: string;
	readonly headline: string;
	readonly copy: string;
	readonly outputs: readonly string[];
}

export interface Value {
	readonly title: string;
	readonly body: readonly string[];
}
