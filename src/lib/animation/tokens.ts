/**
 * Duration and easing tokens, mirroring tokens.motion.css so JS and CSS agree.
 *
 * These live in their OWN module, importing nothing, because they are the only
 * part of the animation system anyone needs before GSAP has loaded. When they
 * lived in motion.ts, `transitions.ts` importing `{ DUR, EASE }` was enough to
 * pull motion.ts → gsap.ts → gsap + ScrollTrigger + SplitText into the root
 * layout chunk — 122 KB of animation library on every page in the site,
 * including /privacy and /start-a-project, which run no animation at all.
 *
 * Two constant objects were dragging in the largest dependency in the project.
 * Keeping them dependency-free is what makes the lazy boundary in lazy.ts hold.
 */

export const EASE = {
	entrance: 'expo.out',
	exit: 'quart.in',
	emphasis: 'quart.inOut',
	inertial: 'expo.out'
} as const;

export const DUR = {
	fast: 0.18,
	base: 0.32,
	deliberate: 0.56,
	cinematic: 0.9
} as const;
