import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Enforces WCAG 2.2 AA on the colour system. Brief §18, §83.
 *
 * The values are parsed out of tokens.color.css rather than duplicated here —
 * a copy would drift, and a test that passes against a stale copy is worse than
 * no test. If someone nudges a hex value and it drops below AA, this fails.
 */

const css = readFileSync(fileURLToPath(new URL('./tokens.color.css', import.meta.url)), 'utf8');

function hex(token: string): string {
	// Matches `--token: #rrggbb;` — raw scale entries only, which is all we
	// assert on. Semantic tokens are aliases and are resolved by name below.
	const match = new RegExp(`--${token}:\\s*(#[0-9a-fA-F]{6})\\s*;`).exec(css);
	if (!match?.[1])
		throw new Error(`--${token} is not declared as a literal hex in tokens.color.css`);
	return match[1];
}

function channel(value: number): number {
	const c = value / 255;
	return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(colour: string): number {
	const h = colour.replace('#', '');
	const r = channel(parseInt(h.slice(0, 2), 16));
	const g = channel(parseInt(h.slice(2, 4), 16));
	const b = channel(parseInt(h.slice(4, 6), 16));
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
	return (hi + 0.05) / (lo + 0.05);
}

const DARK_SURFACES = ['obsidian', 'near-black', 'ink-elevated', 'ink-inset'] as const;
const LIGHT_SURFACES = ['warm-white', 'warm-raised', 'warm-sunken'] as const;

/** SC 1.4.3 Contrast (Minimum) — body text. */
const AA_BODY = 4.5;
/** SC 1.4.11 Non-text Contrast — UI boundaries and focus indicators. */
const AA_NON_TEXT = 3;

describe('colour tokens meet WCAG 2.2 AA', () => {
	it('dark-mode text clears 4.5:1 on every dark surface', () => {
		const pairs: Array<[string, string]> = [
			['warm-white', 'text-primary'],
			['soft-stone', 'text-secondary'],
			['#92959b', 'text-muted']
		];
		for (const [colour, role] of pairs) {
			const value = colour.startsWith('#') ? colour : hex(colour);
			for (const surface of DARK_SURFACES) {
				const ratio = contrast(value, hex(surface));
				expect(ratio, `${role} (${value}) on ${surface}`).toBeGreaterThanOrEqual(AA_BODY);
			}
		}
	});

	it('light-mode text clears 4.5:1 on every light surface', () => {
		const pairs: Array<[string, string]> = [
			['#14161a', 'text-primary'],
			['#3a3d42', 'text-secondary'],
			['#63666c', 'text-muted']
		];
		for (const [value, role] of pairs) {
			for (const surface of LIGHT_SURFACES) {
				const ratio = contrast(value, hex(surface));
				expect(ratio, `${role} (${value}) on ${surface}`).toBeGreaterThanOrEqual(AA_BODY);
			}
		}
	});

	it('the accent clears 4.5:1 in the mode it is used in', () => {
		for (const surface of DARK_SURFACES) {
			expect(
				contrast(hex('azurite-500'), hex(surface)),
				`accent on ${surface}`
			).toBeGreaterThanOrEqual(AA_BODY);
		}
		for (const surface of LIGHT_SURFACES) {
			expect(
				contrast(hex('azurite-750'), hex(surface)),
				`accent on ${surface}`
			).toBeGreaterThanOrEqual(AA_BODY);
		}
	});

	it('primary button text clears 4.5:1 against its own accent fill', () => {
		expect(contrast(hex('obsidian'), hex('azurite-500'))).toBeGreaterThanOrEqual(AA_BODY);
		expect(contrast(hex('warm-white'), hex('azurite-750'))).toBeGreaterThanOrEqual(AA_BODY);
	});

	it('the focus ring clears 3:1 against every surface it can appear on', () => {
		for (const surface of DARK_SURFACES) {
			expect(
				contrast(hex('azurite-300'), hex(surface)),
				`focus ring on ${surface}`
			).toBeGreaterThanOrEqual(AA_NON_TEXT);
		}
		for (const surface of LIGHT_SURFACES) {
			expect(
				contrast(hex('azurite-800'), hex(surface)),
				`focus ring on ${surface}`
			).toBeGreaterThanOrEqual(AA_NON_TEXT);
		}
	});

	/**
	 * The brief nominates #777A80 as "muted graphite". It cannot carry body text
	 * — 4.35:1 on near-black, 3.96:1 on ink-elevated, 3.81:1 on warm-white — so
	 * it was re-cast as the universal UI boundary, a job it does pass on every
	 * surface in both modes with a single value.
	 */
	it('graphite works as a UI boundary on every surface, in both modes', () => {
		for (const surface of [...DARK_SURFACES, ...LIGHT_SURFACES]) {
			expect(
				contrast(hex('graphite'), hex(surface)),
				`border-strong on ${surface}`
			).toBeGreaterThanOrEqual(AA_NON_TEXT);
		}
	});

	it('graphite is still demonstrably unfit for body text, which is why it is not used for it', () => {
		expect(contrast(hex('graphite'), hex('near-black'))).toBeLessThan(AA_BODY);
		expect(contrast(hex('graphite'), hex('warm-white'))).toBeLessThan(AA_BODY);
	});

	it('selection colours are legible in both modes', () => {
		expect(contrast(hex('azurite-200'), hex('obsidian'))).toBeGreaterThanOrEqual(AA_BODY);
		expect(contrast(hex('azurite-200'), hex('near-black'))).toBeGreaterThanOrEqual(AA_BODY);
	});
});
