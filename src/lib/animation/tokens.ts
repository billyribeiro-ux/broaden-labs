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
	/**
	 * `quint.out`, not `expo.out`.
	 *
	 * This value claimed to mirror `--ease-inertial` and did not: the CSS token is
	 * `cubic-bezier(0.22, 1, 0.36, 1)`, which is easeOutQuint, while `--ease-entrance`
	 * is `cubic-bezier(0.16, 1, 0.3, 1)`, which is easeOutExpo. Both constants here
	 * read `'expo.out'`, so the two curves the design system distinguishes were the
	 * same curve in JS and only differed in CSS.
	 *
	 * The difference is the whole reason there are two. expo.out is violently
	 * front-loaded — it is 75% done at a fifth of its duration — so a "long" expo
	 * tween spends most of its time invisible and still reads as a snap. quint.out
	 * carries its motion further into the tail, which is what makes a long settle
	 * feel weighted rather than merely late.
	 */
	inertial: 'quint.out'
} as const;

export const DUR = {
	fast: 0.18,
	base: 0.32,
	deliberate: 0.56,
	cinematic: 0.9,
	/**
	 * The scale gained a sixth step rather than scattering a magic number.
	 *
	 * `cinematic` was the ceiling, and it was tuned for a masked line RISING —
	 * a transform the glyph is not whole until it finishes, so it cannot be long
	 * without leaving the headline clipped. An opacity-led dissolve, and a
	 * transform nothing is waiting on, have no such ceiling.
	 *
	 * Used ONLY for the transform half of a two-property settle, never for the
	 * opacity half. Opacity governs when text is readable, and readable is not
	 * something to keep a visitor waiting 1.4s for; the transform underneath it
	 * is free, because it is composited and nothing depends on it having landed.
	 */
	expansive: 1.4
} as const;
