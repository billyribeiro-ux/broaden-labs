/**
 * Content registry entry point.
 *
 * The Vite content-safety plugin imports THIS module, not individual fixture
 * files, so a new fixture cannot escape the gate: if it is not reachable from
 * here it is not in the site, and if it is in the site it went through
 * `registerContent`.
 *
 * The demo/ modules are side-effecting — importing them is what populates the
 * registry — so they are re-exported rather than merely imported, which also
 * stops a bundler from treeshaking the registration away.
 */

export { demoCredentialRecords, contentRegistrySize, registerContent } from './safety.ts';
export type { DemoRecord, CredentialKind } from './safety.ts';

export * from './schema.ts';
export * from './navigation.ts';
export * from './services.ts';
export * from './narrative.ts';
export * from './insights.ts';

export { CASE_STUDIES, caseStudyBySlug } from './demo/case-studies.ts';
export { TESTIMONIALS, TEAM } from './demo/people.ts';
