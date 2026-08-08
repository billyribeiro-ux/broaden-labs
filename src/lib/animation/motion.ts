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
	/** Stagger between children, in seconds. */
	readonly stagger?: number;
	/** Distance travelled, in px. */
	readonly distance?: number;
	/** Selector for the children to stagger. Omit to animate the element itself. */
	readonly children?: string;
	/** Fraction of the viewport at which it fires. */
	readonly start?: string;
}

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

		const context = gsap.context(() => {
			const media = gsap.matchMedia();

			media.add(MOTION_QUERIES.any, () => {
				gsap.set(targets, { opacity: 0, y: options.distance ?? 16 });

				ScrollTrigger.create({
					trigger: node,
					start: options.start ?? 'top 85%',
					once: true,
					onEnter: () => {
						gsap.to(targets, {
							opacity: 1,
							y: 0,
							duration: DUR.deliberate,
							ease: EASE.entrance,
							stagger: options.stagger ?? 0.06,
							overwrite: 'auto'
						});
					}
				});
			});

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
 * Splits a heading into lines and reveals them behind a mask.
 *
 * SplitText only, and only where the typography earns it — brief §70 lists the
 * hero and major editorial statements as good, and "every paragraph, buttons,
 * form labels, navigation" as bad.
 *
 * Two things this gets right that split-text animations usually do not:
 *
 * 1. It waits for `document.fonts.ready`. Splitting before the webfont settles
 *    measures the fallback's line breaks, so the mask lands mid-word once the
 *    real face swaps in.
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
						mask: 'lines',
						linesClass: 'split-line',
						autoSplit: true
					});
					trackSplit(1);

					gsap.set(split.lines, { yPercent: 110 });

					trigger = ScrollTrigger.create({
						trigger: node,
						start: options.start ?? 'top 85%',
						once: true,
						onEnter: () => {
							gsap.to(split?.lines ?? [], {
								yPercent: 0,
								duration: DUR.cinematic,
								ease: EASE.entrance,
								stagger: 0.08
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
							start: options.start ?? 'top 92%',
							end: options.end ?? 'top 55%',
							scrub: 0.4
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
 * Fast on purpose: the DOM is server-rendered and readable at 0.00s, and this
 * only animates the arrival of already-present content. "Do not make users wait
 * through an intro movie" — there is nothing to wait for, and the CTAs are
 * clickable throughout because nothing is pointer-blocked at any point.
 */
export function heroSequence(): Attachment<HTMLElement> {
	return (node) => {
		const context = gsap.context(() => {
			const media = gsap.matchMedia();

			media.add(MOTION_QUERIES.any, () => {
				const eyebrow = node.querySelector('[data-hero="eyebrow"]');
				const copy = node.querySelector('[data-hero="copy"]');
				const actions = node.querySelector('[data-hero="actions"]');
				const micro = node.querySelector('[data-hero="micro"]');

				const parts = [eyebrow, copy, actions, micro].filter(
					(element): element is Element => element !== null
				);
				if (parts.length === 0) return;

				gsap.set(parts, { opacity: 0, y: 12 });

				// The timeline maps to §25's beats. The headline is handled by
				// splitReveal on its own element, which starts at 0.35s by sitting
				// earlier in the document.
				gsap
					.timeline({ defaults: { ease: EASE.entrance } })
					.to(eyebrow, { opacity: 1, y: 0, duration: DUR.base }, 0.1)
					.to(copy, { opacity: 1, y: 0, duration: DUR.deliberate }, 0.55)
					.to(actions, { opacity: 1, y: 0, duration: DUR.base }, 0.8)
					.to(micro, { opacity: 1, y: 0, duration: DUR.base }, 1.05);
			});

			media.add(MOTION_QUERIES.reduced, () => {
				gsap.set(node.querySelectorAll('[data-hero]'), { clearProps: 'opacity,transform' });
			});
		}, node);

		return () => context.revert();
	};
}

export { DUR, EASE };
