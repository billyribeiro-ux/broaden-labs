/**
 * The production content gate. Brief §13, §55, §120.
 *
 * The site must look complete during development, which means it renders
 * fictional testimonials, client names, outcome metrics and team profiles. None
 * of that may ever reach production presented as real business proof.
 *
 * The mechanism is a BUILD FAILURE rather than a runtime flag, because a runtime
 * flag fails open: forget to set it and the invented content ships silently. A
 * build that refuses to complete cannot be forgotten.
 */

/** Content whose falsity would be a factual claim about a real client. */
export const CREDENTIAL_KINDS = [
	'caseStudy',
	'testimonial',
	'metric',
	'client',
	'teamMember',
	'award'
] as const;

export type CredentialKind = (typeof CREDENTIAL_KINDS)[number];

export interface DemoRecord {
	/** Present and `true` on every fixture. Real content omits it or sets it false. */
	readonly isDemo: boolean;
	readonly kind: CredentialKind;
	/** Stable identifier, used to name the record in the build failure. */
	readonly id: string;
}

/**
 * Every credential-bearing fixture registers here. The Vite plugin imports this
 * module at build time and refuses to finish while any entry is still demo.
 */
const registry: DemoRecord[] = [];

export function registerContent<T extends DemoRecord>(records: readonly T[]): readonly T[] {
	registry.push(...records);
	return records;
}

export function demoCredentialRecords(): readonly DemoRecord[] {
	return registry.filter((record) => record.isDemo);
}

export function contentRegistrySize(): number {
	return registry.length;
}
