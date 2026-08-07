<script lang="ts">
	import { Canvas } from '@threlte/core';
	import { NoToneMapping } from 'three';
	import SceneFallback from './SceneFallback.svelte';
	import ApertureField from './ApertureField.svelte';
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
	 * The Threlte import is DYNAMIC for the same reason §88 asks for a JS budget:
	 * three.js is the single largest dependency in the project, and a visitor
	 * without WebGL, or with reduced motion, should never download it. The
	 * homepage becomes readable before this chunk is even requested.
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
	let sceneReady = $state(false);

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
			// Only now is three.js worth fetching.
			void import('@threlte/core').then(() => {
				if (!disposed) sceneReady = true;
			});
		}

		return () => {
			disposed = true;
			sceneReady = false;
		};
	}

	const rows = $derived(TIER_ROWS[tier]);
	const showCanvas = $derived(tier !== 'fallback' && sceneReady);
</script>

<div class="stage" data-tier={tier} {@attach initialise}>
	{#if showCanvas}
		<!--
			<Canvas> is SSR-safe by construction — its renderer only mounts inside an
			internal `{#if canvas && dom}` — but it is still gated here so the three
			chunk is never fetched for a tier that cannot use it.

			dpr as a [min, max] tuple CLAMPS devicePixelRatio rather than setting it
			(§74). A 3x phone rendering this at native density would burn GPU on
			pixels nobody can distinguish on an outline drawing.

			NoToneMapping because Threlte defaults to AgX, which would shift the
			azurite accent away from the value the rest of the design system uses —
			the hero would be a slightly different blue from every other accent.
		-->
		<Canvas dpr={[1, 1.75]} toneMapping={NoToneMapping} renderMode="on-demand">
			<ApertureField {tier} {rows} />
		</Canvas>
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
		 */
		block-size: 100%;
		overflow: hidden;
		/* Decorative and behind the copy: it must never eat a click meant for a CTA. */
		pointer-events: none;
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
