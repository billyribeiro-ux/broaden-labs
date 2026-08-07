import { describe, it, expect } from 'vitest';
import { registerContent, demoCredentialRecords, contentRegistrySize } from './safety.ts';
import type { DemoRecord } from './safety.ts';

/**
 * Guards the production content gate (brief §13). The gate itself was verified
 * end to end by running a production build against seeded demo records and
 * watching it refuse; these tests hold the selection logic in place so that
 * behaviour cannot regress silently.
 *
 * Note the registry is module-global by design — the Vite plugin imports the
 * content entry point once at buildStart — so these assertions are written to be
 * order-independent rather than assuming an empty starting state.
 */
describe('content safety registry', () => {
	it('selects only records still marked isDemo', () => {
		const before = demoCredentialRecords().length;
		const beforeTotal = contentRegistrySize();

		const records: DemoRecord[] = [
			{ isDemo: true, kind: 'testimonial', id: 'spec-fictional-quote' },
			{ isDemo: true, kind: 'metric', id: 'spec-fictional-metric' },
			{ isDemo: false, kind: 'client', id: 'spec-verified-client' }
		];
		registerContent(records);

		const demo = demoCredentialRecords();
		const ids = demo.map((record) => record.id);

		expect(demo.length).toBe(before + 2);
		expect(contentRegistrySize()).toBe(beforeTotal + 3);
		expect(ids).toContain('spec-fictional-quote');
		expect(ids).toContain('spec-fictional-metric');
		// The whole point: a record that is NOT demo must never be reported, or the
		// gate would block builds over real content and get switched off.
		expect(ids).not.toContain('spec-verified-client');
	});

	it('returns the records it was given, so fixtures can register inline', () => {
		const records = [{ isDemo: true, kind: 'award', id: 'spec-passthrough' }] as const;
		expect(registerContent(records)).toBe(records);
	});
});
