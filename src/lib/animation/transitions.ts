import { onNavigate } from '$app/navigation';
import { DUR, EASE } from './tokens.ts';

/**
 * Page transitions. Brief §72.
 *
 * Deliberately restrained. §72: "Keep transitions short. Navigation should never
 * feel slower because of animation." The outgoing content lifts and fades over
 * 180ms; the incoming content settles over 320ms. There is no full-viewport
 * masking plane, because a plane that covers the page necessarily delays the
 * moment the next page becomes readable, and on a content site that is a cost
 * with no matching benefit.
 *
 * `onNavigate` is the correct hook rather than a component lifecycle: Kit awaits
 * the promise it returns BEFORE swapping the DOM, and runs the returned function
 * AFTER the DOM has updated. That gives an exit and an entrance around a commit
 * we do not otherwise control.
 *
 * Three things this deliberately does not do:
 *
 * 1. It does not run on shallow navigations. `navigation.shallow` is true when
 *    only page.state changed — animating a page that did not change would be
 *    motion with no conceptual relationship to content (§101).
 * 2. It does not animate on a browser Back/Forward. Restoring a previous page
 *    should feel instantaneous; a transition there reads as latency.
 * 3. It never sets `visibility: hidden`. Brief §115 — content hidden for
 *    animation must remain visible if JavaScript fails, and an opacity that is
 *    only ever set by JS satisfies that where a CSS-hidden element would not.
 */
export function usePageTransitions(): void {
	onNavigate((navigation) => {
		// A shallow navigation has not changed the page, and a popstate is the
		// visitor asking to go back — neither wants choreography.
		if (navigation.shallow || navigation.type === 'popstate') return;

		// Respect the OS setting at the moment of navigation rather than at load,
		// so toggling it mid-session takes effect immediately.
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const main = document.querySelector('main');
		if (!main) return;

		/**
		 * GSAP is fetched HERE, on the first real navigation, rather than imported
		 * at the top of this module. A static import put the whole 122 KB library
		 * into the root layout chunk, so every visitor to every page downloaded it
		 * before first paint to power a transition that, by definition, cannot run
		 * until they navigate. Kit awaits this promise before swapping the DOM, so
		 * the import fits the existing contract with no extra machinery.
		 */
		return new Promise<() => void>((resolve) => {
			void import('./gsap.ts').then(({ gsap }) => {
				gsap.to(main, {
					opacity: 0,
					y: -8,
					duration: DUR.fast,
					ease: EASE.exit,
					onComplete: () =>
						resolve(() => {
							// Runs after Kit has swapped the DOM. `main` is the same element —
							// Kit replaces its children, not the element itself — so the
							// entrance animates the new content.
							gsap.fromTo(
								main,
								{ opacity: 0, y: 8 },
								{
									opacity: 1,
									y: 0,
									duration: DUR.base,
									ease: EASE.entrance,
									// clearProps so no inline opacity or transform survives the
									// transition. A leftover `opacity: 1` would be harmless; a
									// leftover transform creates a containing block that breaks
									// `position: fixed` descendants on the next page.
									clearProps: 'opacity,transform'
								}
							);
						})
				});
			});
		});
	});
}
