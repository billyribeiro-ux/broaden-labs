import type { Attachment } from 'svelte/attachments';

/**
 * The bundling boundary between the page and GSAP.
 *
 * This module must import NOTHING from ./gsap.ts or ./motion.ts, statically or
 * transitively. That constraint is the entire reason it exists, and
 * `bundle.spec.ts` asserts it against the built output.
 *
 * Why: `{@attach reveal()}` reads as lazy — the animation only runs once the
 * element is in the DOM — but the `import { reveal }` at the top of the
 * component is a static edge in the module graph, so Rollup put gsap,
 * ScrollTrigger and SplitText into the chunk for every page that used one. The
 * root layout was the worst case: it imported `usePageTransitions`, so all
 * 122 KB landed in the layout chunk and was downloaded by every visitor to
 * every route, including the pages that run no animation at all.
 *
 * This is the same mistake as the one WebGLStage made with three.js, in a
 * different costume. `{#if}` gates rendering; `{@attach}` gates execution.
 * Neither gates bundling. Only `import()` does.
 *
 * Nothing is lost by deferring: no animation here participates in first paint.
 * Every one is an enhancement that begins after mount, and a visitor who has
 * asked for reduced motion never needs the library at all.
 */
export function lazyAttach<T extends Element>(load: () => Promise<Attachment<T>>): Attachment<T> {
	return (node: T) => {
		let disposed = false;
		let teardown: void | (() => void);

		void load().then((attach) => {
			/**
			 * Both guards are load-bearing. The chunk resolves a network round trip
			 * after the attachment ran, by which time the component may have been
			 * destroyed (`disposed`) or the element detached by a client-side
			 * navigation (`isConnected`). Attaching a ScrollTrigger to a detached
			 * node leaks it onto the global scroller, which is exactly what
			 * motion.e2e.ts exists to catch.
			 */
			if (disposed || !node.isConnected) return;
			teardown = attach(node);
		});

		return () => {
			disposed = true;
			teardown?.();
		};
	};
}
