/**
 * Content registry entry point.
 *
 * The Vite content-safety plugin imports THIS module (not individual fixture
 * files) so that adding a new fixture file cannot accidentally escape the gate:
 * if it is not re-exported here it is not in the site, and if it is in the site
 * it went through `registerContent`.
 *
 * Fixtures land in M3. Until then the registry is legitimately empty.
 */

export { demoCredentialRecords, contentRegistrySize, registerContent } from './safety.ts';
export type { DemoRecord, CredentialKind } from './safety.ts';
