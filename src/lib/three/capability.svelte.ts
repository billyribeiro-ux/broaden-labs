/**
 * WebGL capability tiers. Brief §75.
 *
 * Four tiers, and the page must be complete and usable in all of them:
 *
 *   rich     — full scene, 96 plates, pointer parallax
 *   medium   — fewer plates, no parallax (small screens, weak GPUs)
 *   still    — scene mounted but not animated (reduced motion)
 *   fallback — no WebGL at all; the SVG composition is what renders
 *
 * Detection runs on the CLIENT ONLY and starts at `fallback`. That ordering is
 * deliberate and is what makes SSR safe: the server has no way to know whether
 * a visitor has WebGL, so it renders the fallback, and the fallback is what the
 * HTML contains. Upgrading afterwards is a state change the client owns, so
 * there is nothing for hydration to mismatch on. Guessing `rich` on the server
 * would produce a canvas in the HTML that half of visitors could never use.
 */
export type Tier = 'rich' | 'medium' | 'still' | 'fallback';

/**
 * Probes for a real WebGL2 context rather than checking for the constructor.
 * `'WebGL2RenderingContext' in window` is true in browsers where context
 * creation still fails — blocklisted drivers, a GPU process that has crashed,
 * or a hardened privacy setting.
 */
function hasWebGL(): boolean {
	try {
		const canvas = document.createElement('canvas');
		const gl = canvas.getContext('webgl2');
		if (!gl) return false;
		// Release it immediately; a probe context still consumes one of the
		// browser's limited context slots until it is collected.
		gl.getExtension('WEBGL_lose_context')?.loseContext();
		return true;
	} catch {
		return false;
	}
}

export interface CapabilityOverrides {
	/** Forces a tier. Used by the E2E suite to exercise all four for real. */
	readonly force?: Tier | undefined;
}

export function detectTier(overrides: CapabilityOverrides = {}): Tier {
	if (overrides.force) return overrides.force;
	if (typeof window === 'undefined') return 'fallback';

	if (!hasWebGL()) return 'fallback';

	// Reduced motion outranks capability: a powerful machine whose owner asked
	// for less motion gets the composition, not the choreography.
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'still';

	// `deviceMemory` is Chromium-only and absent elsewhere, so it can only ever
	// demote — never gate. A missing value means "unknown", not "weak".
	const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
	const lowMemory = typeof memory === 'number' && memory <= 4;
	const smallViewport = window.innerWidth < 1024;
	const coarsePointer = window.matchMedia('(pointer: coarse)').matches;

	if (lowMemory || smallViewport || coarsePointer) return 'medium';
	return 'rich';
}

/** How many plates each tier draws. The grid stays 12 wide; rows shrink. */
export const TIER_ROWS: Record<Tier, number> = {
	rich: 8,
	medium: 5,
	still: 8,
	fallback: 0
};

/** Pointer parallax is off wherever it would be misleading or expensive. */
export function allowsParallax(tier: Tier): boolean {
	return tier === 'rich';
}
