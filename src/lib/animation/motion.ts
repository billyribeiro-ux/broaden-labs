import type { Attachment } from 'svelte/attachments';
import { gsap, ScrollTrigger, SplitText, trackSplit } from './gsap.ts';
import { DUR, EASE } from './tokens.ts';
import { MOTION_QUERIES } from './reduced-motion.ts';

/**
 * The motion primitives. Brief §66, §67, §77.
 *
 * Every one of these is an ATTACHMENT, not an action and not an $effect.
 * Svelte's own Best Practices page steers external-library sync to `{@attach}`,
 * and the teardown contract is exactly GSAP's: an attachment's returned
 * function runs both before the attachment re-runs AND when the element leaves
 * the DOM, which is precisely when `ctx.revert()` needs to happen.
 *
 * That teardown is not optional. A SvelteKit client-side navigation destroys
 * the component but ScrollTrigger instances live on the global scroller — so
 * without revert(), leaving and returning to a page accumulates ghost triggers
 * that fight the next page's scroll. The leak test asserts the count returns to
 * its first-visit value across three A→B→A cycles.
 *
 * THE TRAP, stated because it is easy to fall into: attachments re-run when any
 * state read inside them changes. Passing a live scroll value in would tear
 * down and rebuild the whole timeline every frame. Every attachment here takes
 * plain options captured once, and anything reactive is read through a getter.
 */

export interface RevealOptions {
	/** Stagger between children, in seconds, at the rich breakpoint. */
	readonly stagger?: number;
	/** Distance travelled, in px, at the rich breakpoint. */
	readonly distance?: number;
	/** Selector for the children to stagger. Omit to animate the element itself. */
	readonly children?: string;
	/** Fraction of the viewport at which it fires. */
	readonly start?: string;
}

/**
 * How much of the desktop choreography a small screen gets.
 *
 * Brief §68: mobile is DESIGNED, not scaled. A stagger tuned for three cards
 * sitting side by side becomes a queue when the same three stack vertically —
 * the last card is then a full beat behind a viewport it already fills — and a
 * 32px rise that reads as a lift across a 1440px row reads as a lurch across a
 * 390px column. The compact breakpoint therefore travels a shorter distance and
 * spends a shorter time doing it, rather than replaying the desktop sequence.
 *
 * `rich` and `compact` are mutually exclusive by construction (see
 * reduced-motion.ts), so exactly one of them is ever live, and gsap.matchMedia
 * reverts the other's tweens when the viewport crosses the boundary.
 */
const COMPACT_SCALE = 0.55;

/**
 * Reveals an element (or its children) once, on scroll.
 *
 * `once: true` because a reveal that replays every time you scroll past is a
 * distraction, not a flourish — and because a one-shot trigger can be killed
 * immediately after firing, which keeps the global trigger count down.
 *
 * The element is NOT hidden in CSS. Brief §115: anything hidden for animation
 * must still be visible if JavaScript fails. The starting state is set here, in
 * JS, so a visitor without JS sees finished content rather than a blank page.
 */
export function reveal(options: RevealOptions = {}): Attachment<HTMLElement> {
	return (node) => {
		const targets = options.children ? node.querySelectorAll(options.children) : [node];
		if (targets.length === 0) return;

		/**
		 * One choreography, expressed at two scales. Returned as a factory rather
		 * than duplicated so the two breakpoints cannot drift apart — the only
		 * difference between them is how far and how spread out.
		 */
		const choreography = (scale: number) => () => {
			const distance = (options.distance ?? 12) * scale;
			const each = (options.stagger ?? 0.1) * scale;

			// `from: 'start'` is the default, declared because it is a choreographic
			// decision: the sequence reads left-to-right, top-to-bottom, the same
			// direction the copy is read. Shared by both tweens below so the two
			// halves of one entrance cannot drift out of phase.
			const stagger = { each, from: 'start' } as const;

			gsap.set(targets, { opacity: 0, y: distance });

			ScrollTrigger.create({
				trigger: node,
				start: options.start ?? 'top 85%',
				once: true,
				/**
				 * TWO tweens, not one, because the two properties are answering two
				 * different questions and want two different lengths.
				 *
				 * Opacity decides when the content is READABLE, so it settles first
				 * and on the sharper curve. The rise is decoration underneath it: it
				 * is composited, nothing waits on it, and letting it keep travelling
				 * for half a second after the text is already legible is what makes
				 * the arrival read as weighted rather than as a fade that stopped.
				 *
				 * One tween cannot express that — a single `duration` would either
				 * hold the text dim for 1.4s or cut the travel short at 0.9s.
				 *
				 * `overwrite: 'auto'` is property-level in GSAP: it kills conflicting
				 * parts of other tweens on the same target, and these two share no
				 * property, so they do not fight.
				 */
				onEnter: () => {
					gsap.to(targets, {
						opacity: 1,
						duration: DUR.cinematic,
						ease: EASE.entrance,
						stagger,
						overwrite: 'auto'
					});
					gsap.to(targets, {
						y: 0,
						duration: DUR.expansive,
						ease: EASE.inertial,
						stagger,
						overwrite: 'auto'
					});
				}
			});
		};

		const context = gsap.context(() => {
			const media = gsap.matchMedia();

			media.add(MOTION_QUERIES.rich, choreography(1));
			media.add(MOTION_QUERIES.compact, choreography(COMPACT_SCALE));

			// Under reduced motion nothing is ever hidden, so there is nothing to
			// reveal — the content is simply present. Preserving layout and content
			// is the requirement; a fade-in is not.
			media.add(MOTION_QUERIES.reduced, () => {
				gsap.set(targets, { clearProps: 'opacity,transform' });
			});
		}, node);

		return () => context.revert();
	};
}

/**
 * Splits a heading into lines and dissolves them in, line by line.
 *
 * SplitText only, and only where the typography earns it — brief §70 lists the
 * hero and major editorial statements as good, and "every paragraph, buttons,
 * form labels, navigation" as bad.
 *
 * NO MASK, deliberately, and this is a change from the previous pass.
 *
 * `mask: 'lines'` clips each line to its own box, so the glyph is not whole
 * until the transform has finished — the mask makes the TRANSFORM the thing
 * legibility waits on. That caps how long the settle can be: a 1.4s masked rise
 * is a headline sitting visibly guillotined for over a second. Leading with
 * opacity instead removes the cap. The line fades up through a short rise that
 * keeps drifting after the text is already readable, which is the same
 * two-speed shape `reveal` uses and reads as a dissolve rather than a reveal
 * mechanism.
 *
 * THIS IS THE LCP ELEMENT and the timing here does not touch it. Measured
 * against the production build under applied CDP throttling, at three profiles:
 * the h1 is the LCP node and its single LCP entry lands at exactly FCP —
 * 872/872ms on slow-4g + 4x CPU, 1580/1580ms on slow-3g + 4x CPU, 44/44ms
 * unthrottled — while the first `.split-line` element does not exist until
 * 2673ms, 8855ms and 80ms respectively. The headline is served in the HTML,
 * paints with the page, and banks LCP long before GSAP has been fetched. What
 * would break that is hiding it in CSS, which is exactly what brief §115
 * already forbids and what nothing here does.
 *
 * Two things this gets right that split-text animations usually do not:
 *
 * 1. It waits for `document.fonts.ready`. Splitting before the webfont settles
 *    measures the fallback's line breaks, so the lines are cut in the wrong
 *    places once the real face swaps in and the stagger runs down a sequence
 *    that no longer matches what is on screen.
 * 2. `autoSplit: true` re-splits on resize. Without it, rotating a phone leaves
 *    the lines broken at the old width.
 *
 * Accessibility: SplitText wraps each line in a <div>, which would normally
 * make a screen reader read a heading word by word. `aria-label` on the element
 * preserves the original string as the accessible name.
 */
export function splitReveal(options: { start?: string } = {}): Attachment<HTMLElement> {
	return (node) => {
		const original = node.textContent?.trim() ?? '';
		let split: SplitText | null = null;
		let trigger: ScrollTrigger | null = null;
		let disposed = false;

		const context = gsap.context(() => {
			const media = gsap.matchMedia();

			media.add(MOTION_QUERIES.any, () => {
				// Fonts first — see above. If the promise never settles we simply do
				// not animate, which leaves readable text rather than hidden text.
				void document.fonts.ready.then(() => {
					/**
					 * `disposed` as well as `isConnected`.
					 *
					 * gsap.context() only adopts animations and ScrollTriggers created
					 * SYNCHRONOUSLY inside its callback. Anything created later — here,
					 * after a promise resolves — is invisible to `context.revert()`.
					 *
					 * That produced a real leak, caught by the A→B→A test: the homepage
					 * came back with 10 live ScrollTriggers against a ceiling of 9,
					 * because this one outlived every revert. The trigger is now held in
					 * a variable and killed explicitly, and the guard stops a late
					 * promise from creating one after teardown has already run.
					 */
					if (disposed || !node.isConnected) return;

					node.setAttribute('aria-label', original);
					split = SplitText.create(node, {
						type: 'lines',
						linesClass: 'split-line',
						autoSplit: true
					});
					trackSplit(1);

					gsap.set(split.lines, { opacity: 0, yPercent: 26 });

					/**
					 * `amount` rather than `each`: it is the TOTAL spread across the
					 * lines, however many there are.
					 *
					 * Measured against this build, `.split-line` count by viewport:
					 * 7 lines at 390px, 4 at 768px, 2 at 1440px, 4 at 2560px. It is
					 * not monotonic — the display size grows with the viewport, so the
					 * widest screen wraps more than the 1440px one.
					 *
					 * With a per-line interval the phone would spend three and a half
					 * times as long on the same sentence as the 1440px desktop — the
					 * small screen, the one least able to afford the wait, getting the
					 * longest opening. A fixed total keeps the cadence of the hero
					 * identical at every width and simply spaces the lines more
					 * tightly when there are more of them.
					 */
					const stagger = { amount: 0.34, from: 'start' } as const;

					trigger = ScrollTrigger.create({
						trigger: node,
						start: options.start ?? 'top 85%',
						once: true,
						onEnter: () => {
							const lines = split?.lines ?? [];
							gsap.to(lines, {
								opacity: 1,
								duration: DUR.cinematic,
								ease: EASE.entrance,
								stagger
							});
							gsap.to(lines, {
								yPercent: 0,
								duration: DUR.expansive,
								ease: EASE.inertial,
								stagger
							});
						}
					});
				});
			});
		}, node);

		return () => {
			disposed = true;

			// Killed explicitly because the context never adopted it — see above.
			trigger?.kill();
			trigger = null;

			// revert() puts the original text back before the element is discarded,
			// so a re-render never inherits SplitText's wrapper divs.
			if (split) {
				split.revert();
				trackSplit(-1);
				split = null;
			}
			node.removeAttribute('aria-label');
			context.revert();
		};
	};
}

/**
 * Drives the Aperture motif's `--aperture` custom property from scroll.
 *
 * One CSS variable, written by one ScrollTrigger, consumed by a composited
 * `transform: scaleX()`. No per-frame JS in the component, no layout, no paint.
 *
 * `scrub` uses linear easing by definition — an eased scrub reads as input lag
 * rather than as polish, which is why `--ease-linear` exists in the token set
 * and is legal only here.
 *
 * The hairline is now drawn over a LONGER stretch of scroll and catches up more
 * slowly: the run starts higher (top 96% rather than 92%) and finishes lower
 * (top 42% rather than 55%), which spreads the same line across 54% of the
 * viewport instead of 37% — about half again as much travel for the same
 * gesture. `scrub` went 0.4 → 0.7.
 *
 * The numeric scrub is a catch-up time in seconds, NOT an ease: the value still
 * tracks the scroll position exactly rather than easing each frame's paint, so
 * the rule stated above is intact. It simply arrives with weight instead of
 * snapping to the finger.
 */
export function apertureScroll(
	options: { start?: string; end?: string } = {}
): Attachment<HTMLElement> {
	return (node) => {
		const context = gsap.context(() => {
			const media = gsap.matchMedia();

			media.add(MOTION_QUERIES.any, () => {
				gsap.fromTo(
					node,
					{ '--aperture': 0 },
					{
						'--aperture': 1,
						ease: 'none',
						scrollTrigger: {
							trigger: node,
							start: options.start ?? 'top 96%',
							end: options.end ?? 'top 42%',
							scrub: 0.7
						}
					}
				);
			});

			media.add(MOTION_QUERIES.reduced, () => {
				// Fully drawn, immediately. The motif still communicates structure;
				// it just does not travel.
				gsap.set(node, { '--aperture': 1 });
			});
		}, node);

		return () => context.revert();
	};
}

/**
 * The hero opening sequence. Brief §25.
 *
 * Unhurried, but never a wait: the DOM is server-rendered and readable at
 * 0.00s, and this only animates the ARRIVAL of already-present content. "Do not
 * make users wait through an intro movie" — there is nothing to wait for, and
 * the CTAs are clickable throughout because nothing is pointer-blocked at any
 * point and nothing is delayed before it begins to paint.
 *
 * THE BEATS OVERLAP DELIBERATELY, and they overlap harder than they used to.
 * Every beat now begins while the one before it is roughly a third settled,
 * so the hero reads as one continuous arrival rather than four fades in a
 * queue. Overlap is what reads as choreography; the gaps between short beats
 * are what read as lag, and the previous pass had run out of overlap because
 * each beat was only 0.32s long.
 *
 * The headline is not on this timeline — it is `splitReveal` on its own
 * element, opening at 0.00s alongside the eyebrow.
 *
 *   beat      starts   opacity (0.9s)   rise (1.4s)
 *   eyebrow    0.00        → 0.90         → 1.40
 *   headline   0.00        → 1.24         → 1.74      (splitReveal, staggered)
 *   lede       0.34        → 1.24         → 1.74
 *   actions    0.62        → 1.52         → 2.02
 *   microcopy  0.78        → 1.68         → 2.18
 *
 * Total span 1.12s → 2.18s. The last half-second of that is transform only:
 * every element is ≥99% opaque by 1.38s, because opacity is what decides when
 * something is readable and the rise underneath it is free.
 */
export function heroSequence(): Attachment<HTMLElement> {
	return (node) => {
		/**
		 * Offsets are absolute positions on the timeline, not relative, so the
		 * cadence is readable as a score rather than as accumulated arithmetic.
		 * `scale` compresses the whole score on small screens — see COMPACT_SCALE:
		 * the compact hero has less to take in, so waiting the desktop interval
		 * reads as lag rather than as pacing. Only the OFFSETS scale; the
		 * durations do not, because a shorter fade on a phone is the snappiness
		 * this pass exists to remove.
		 */
		const choreography = (scale: number, rise: number) => () => {
			const eyebrow = node.querySelector('[data-hero="eyebrow"]');
			const copy = node.querySelector('[data-hero="copy"]');
			const actions = node.querySelector('[data-hero="actions"]');
			const micro = node.querySelector('[data-hero="micro"]');

			const parts = [eyebrow, copy, actions, micro].filter(
				(element): element is Element => element !== null
			);
			if (parts.length === 0) return;

			gsap.set(parts, { opacity: 0, y: rise });

			const timeline = gsap.timeline();

			/**
			 * One beat is two tweens starting together — see `reveal` for why.
			 * Opacity settles on the sharper curve because it governs legibility;
			 * the rise carries on underneath on the softer one, and is still
			 * travelling half a second after the words can be read.
			 */
			const beat = (element: Element | null, at: number) => {
				if (!element) return;
				timeline
					.to(element, { opacity: 1, duration: DUR.cinematic, ease: EASE.entrance }, at * scale)
					.to(element, { y: 0, duration: DUR.expansive, ease: EASE.inertial }, at * scale);
			};

			beat(eyebrow, 0);
			beat(copy, 0.34);
			beat(actions, 0.62);
			beat(micro, 0.78);
		};

		const context = gsap.context(() => {
			const media = gsap.matchMedia();

			media.add(MOTION_QUERIES.rich, choreography(1, 12));
			media.add(MOTION_QUERIES.compact, choreography(0.7, 8));

			media.add(MOTION_QUERIES.reduced, () => {
				gsap.set(node.querySelectorAll('[data-hero]'), { clearProps: 'opacity,transform' });
			});
		}, node);

		return () => context.revert();
	};
}

export { DUR, EASE };
