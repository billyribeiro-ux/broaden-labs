/**
 * Reduced motion. Brief §69.
 *
 * The PRIMARY mechanism in this codebase is CSS: `tokens.motion.css` collapses
 * every duration and distance token under `prefers-reduced-motion: reduce`, so
 * anything driven by a transition is already handled without a line of JS.
 *
 * This module covers the GSAP half. `gsap.matchMedia()` is the right tool
 * because it reverts cleanly when the query flips — a visitor who toggles the
 * OS setting mid-session gets the static composition immediately, with no
 * reload, and every tween GSAP created is undone rather than left mid-flight.
 *
 * Svelte's `prefersReducedMotion` from svelte/motion is deliberately NOT used
 * here: it has no SSR fallback, so reading `.current` during render produces a
 * value the server cannot know and a hydration mismatch.
 */
export const REDUCE = '(prefers-reduced-motion: reduce)';
export const ALLOW = '(prefers-reduced-motion: no-preference)';

/** Media query strings for gsap.matchMedia, one place so they cannot drift. */
export const MOTION_QUERIES = {
	/** Full choreography. Desktop, fine pointer, motion allowed. */
	rich: `${ALLOW} and (min-width: 64rem)`,
	/** Reduced choreography for small screens — brief §68: mobile is designed, not scaled. */
	compact: `${ALLOW} and (max-width: 63.999rem)`,
	/** Any viewport, motion allowed. */
	any: ALLOW,
	/** Motion suppressed. */
	reduced: REDUCE
} as const;
