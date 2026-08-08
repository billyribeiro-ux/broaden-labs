<script lang="ts">
	import type { Component } from 'svelte';
	import SceneFallback from './SceneFallback.svelte';
	import { detectTier, TIER_ROWS, type Tier } from '#lib/three/capability.svelte';

	/**
	 * Mount point for the hero scene. Brief §75, §76, §88.
	 *
	 * The tier starts at `fallback` and is only upgraded on the client, after
	 * mount. That is what makes this SSR-safe without a `{#if browser}` guard:
	 * the server renders the SVG, the HTML contains the SVG, and the upgrade is a
	 * state change the client owns — so there is nothing for hydration to
	 * mismatch on.
	 *
	 * The scene is loaded through `import('./ApertureScene.svelte')` and NOTHING
	 * in this file may import three.js or Threlte statically — that is the whole
	 * point of ApertureScene existing as a separate module. An earlier version of
	 * this component imported `Canvas` and `NoToneMapping` at the top and gated
	 * only the markup, and the comment here claimed the import was dynamic. It was
	 * not: `{#if}` gates rendering, never bundling. Lighthouse caught it — 192 KiB
	 * of three.js shipped to every mobile visitor, including the `fallback` tier
	 * that never renders a canvas. `webgl.bundle.spec.ts` now asserts the split so
	 * a future static import fails the build rather than the score.
	 */
	interface Props {
		/**
		 * Forces a tier. The E2E suite uses this to exercise all four for real
		 * rather than asserting that the detector returns the right string.
		 */
		force?: Tier | undefined;
	}

	let { force }: Props = $props();

	let tier = $state<Tier>('fallback');

	/**
	 * `$state.raw`, not `$state`: this holds a component — a function with a
	 * prototype — and deep-proxying it would be both pointless and wrong. It is
	 * only ever replaced wholesale.
	 */
	let Scene = $state.raw<Component<{ tier: Tier; rows: number }> | null>(null);

	/**
	 * Detection and the dynamic import both live in an attachment rather than
	 * onMount: the attachment's teardown gives a place to mark the component gone
	 * so a late import cannot mount a canvas into a detached tree.
	 */
	function initialise() {
		let disposed = false;

		// A query string override exists so a tier can be forced in a real browser
		// without a test harness — useful for checking the fallback by hand.
		const override = new URLSearchParams(window.location.search).get('tier');
		const forced =
			force ??
			(override === 'rich' ||
			override === 'medium' ||
			override === 'still' ||
			override === 'fallback'
				? override
				: undefined);

		const detected = detectTier(forced ? { force: forced } : {});
		tier = detected;

		if (detected !== 'fallback') {
			// Only now is three.js worth fetching. This is the ONE reference to the
			// scene module anywhere in the app, and it is what makes it a chunk.
			void import('./ApertureScene.svelte').then((module) => {
				if (!disposed) Scene = module.default;
			});
		}

		return () => {
			disposed = true;
			Scene = null;
		};
	}

	const rows = $derived(TIER_ROWS[tier]);
</script>

<div class="stage" data-tier={tier} {@attach initialise}>
	{#if Scene}
		<!--
			`Scene` is null on the server and on the first client frame, so the SVG
			below is what SSR emits and what hydration matches. It becomes non-null
			only after the tier is known AND the chunk has arrived.
		-->
		<Scene {tier} {rows} />
	{:else}
		<SceneFallback rows={rows || 8} />
	{/if}
</div>

<style>
	.stage {
		position: absolute;
		inset: 0;
		z-index: var(--z-below);
		/*
		 * Threlte's <Canvas> wrapper is width/height 100% of its parent — with no
		 * parent height the canvas collapses to 0 and nothing renders. This is the
		 * single most common "blank Threlte scene", so the height is explicit.
		 *
		 * 112%, offset by -6%, rather than 100%: the parallax below travels 5% of
		 * this box, and a field that travels needs somewhere to travel FROM. The
		 * overhang is what stops the drift exposing an empty band at either edge.
		 * `.hero` clips it — see the `overflow: clip` there.
		 */
		block-size: 112%;
		inset-block-start: -6%;
		overflow: hidden;
		/* Decorative and behind the copy: it must never eat a click meant for a CTA. */
		pointer-events: none;
	}

	/**
	 * Depth on the hero field, driven by the scroll position rather than by JS.
	 *
	 * The field lags the page as it scrolls — the oldest parallax there is, and
	 * still the one that reads as depth rather than as decoration. 5% of a 112%
	 * box is roughly 40px of travel at 1440×900; enough to separate the field
	 * from the copy plane, small enough that nothing appears to slide.
	 *
	 * `animation-timeline: scroll()` keeps this OFF THE MAIN THREAD entirely.
	 * There is no scroll listener, no ScrollTrigger, no rAF and no GSAP — which
	 * matters here specifically, because this element is in the viewport during
	 * the load window Lighthouse measures TBT over.
	 *
	 * Support was measured in the browsers this project pins, not assumed:
	 * Chromium 151 yes, WebKit 26.5 yes, Firefox 153 NO. So it is wrapped in
	 * @supports and Firefox simply gets the resting composition — a correct
	 * state, not a broken one. Same mechanism and same reasoning as the header
	 * hairline in SiteHeader.svelte.
	 *
	 * CLS is structurally unaffected: `.stage` is absolutely positioned and
	 * pointer-events: none, so neither its size nor its transform can move,
	 * resize or reflow anything else on the page.
	 */
	@supports (animation-timeline: scroll()) {
		@media (prefers-reduced-motion: no-preference) {
			.stage {
				animation: stage-depth linear both;
				animation-timeline: scroll();
				/*
				 * The same 5% of travel, spent over a longer stretch of scroll:
				 * 110svh rather than 90svh. The field therefore lags the page by
				 * more at any given moment, which is what reads as mass — a
				 * background that keeps up is not behind anything.
				 *
				 * The hero is min 78svh, so the drift now outlives the hero rather
				 * than finishing inside it. That is deliberate: the stage is clipped
				 * by `.hero`'s `overflow: clip`, so the tail of the travel happens
				 * off-screen instead of visibly stopping while still in view.
				 */
				animation-range: 0 110svh;
			}
		}
	}

	/*
	 * `translate` rather than `transform`, so this composes with anything the
	 * scene itself may set on `transform` instead of overwriting it.
	 */
	@keyframes stage-depth {
		to {
			translate: 0 5%;
		}
	}

	/*
	 * A soft vignette toward the text side keeps the headline's contrast ratio
	 * intact over the field. The measured 16.62:1 of warm-white on obsidian is
	 * what the colour system guarantees, and it only holds if what sits behind
	 * the text is still essentially obsidian.
	 */
	.stage::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			100deg,
			var(--surface-primary) 0%,
			var(--surface-primary) 30%,
			color-mix(in srgb, var(--surface-primary) 55%, transparent) 52%,
			transparent 72%
		);
	}
</style>
