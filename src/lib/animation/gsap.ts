import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

/**
 * GSAP registration. Brief §66, §67.
 *
 * Imported and registered at MODULE SCOPE, which is safe during SSR:
 * `ScrollTrigger.register(core)` is guarded by `_windowExists() &&
 * window.document`, so on the server it is a no-op rather than a crash. What is
 * NOT safe on the server is creating triggers or calling `new SplitText(el)` —
 * both touch the DOM — so those only ever happen inside an attachment, which
 * does not run during SSR.
 *
 * SplitText and ScrollTrigger ship inside the plain `gsap` package (since
 * 3.13.0, when the former Club plugins became free), so there is no second
 * dependency and no licence gate. Note gsap's licence field is the non-SPDX
 * string "Standard 'no charge' license" — free to use here, but it will show up
 * as UNKNOWN in an SPDX scanner, which is worth pre-declaring rather than
 * discovering at a release gate.
 */
gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Dev-only registry so tests can prove nothing leaks across navigation.
 *
 * ScrollTrigger.getAll() is enumerable, which is what makes the leak test
 * possible at all. Bare requestAnimationFrame loops are NOT enumerable by any
 * API, which is precisely why every loop in this codebase goes through
 * gsap.ticker instead — see motion.ts.
 */
declare global {
	interface Window {
		__BROADEN_MOTION__?: {
			scrollTriggers: () => number;
			tickerListeners: () => number;
			splits: () => number;
		};
	}
}

let splitCount = 0;

export function trackSplit(delta: number): void {
	splitCount += delta;
}

if (typeof window !== 'undefined') {
	window.__BROADEN_MOTION__ = {
		scrollTriggers: () => ScrollTrigger.getAll().length,
		// gsap.ticker exposes its listener count via the internal _listeners array;
		// falling back to -1 rather than throwing keeps the probe honest if the
		// shape changes in a future release.
		tickerListeners: () => {
			const ticker = gsap.ticker as unknown as { _listeners?: unknown[] };
			return Array.isArray(ticker._listeners) ? ticker._listeners.length : -1;
		},
		splits: () => splitCount
	};
}

export { gsap, ScrollTrigger, SplitText };
