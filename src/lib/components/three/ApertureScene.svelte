<script lang="ts">
	import { Canvas } from '@threlte/core';
	import { NoToneMapping } from 'three';
	import ApertureField from './ApertureField.svelte';
	import type { Tier } from '#lib/three/capability.svelte';

	/**
	 * The WebGL half of the hero, split into its own module so that three.js and
	 * Threlte can be code-split OUT of the homepage.
	 *
	 * This file exists purely as a bundling boundary. It was previously inline in
	 * WebGLStage, whose comment claimed the import was dynamic — it was not. A
	 * `{#if}` around <Canvas> gates RENDERING, not BUNDLING: the static
	 * `import { Canvas }` at the top of that file put the whole three.js graph
	 * into the homepage's route node regardless. Lighthouse measured the result at
	 * 192 KiB transferred and 763 KB raw for `nodes/2`, downloaded by every mobile
	 * visitor including the ones on the `fallback` tier who never get a canvas.
	 *
	 * Nothing may import this file statically. WebGLStage reaches it through
	 * `import('./ApertureScene.svelte')` and nothing else should reach it at all.
	 */
	interface Props {
		tier: Tier;
		rows: number;
	}

	let { tier, rows }: Props = $props();
</script>

<!--
	dpr as a [min, max] tuple CLAMPS devicePixelRatio rather than setting it
	(§74). A 3x phone rendering this at native density would burn GPU on pixels
	nobody can distinguish on an outline drawing.

	NoToneMapping because Threlte defaults to AgX, which would shift the azurite
	accent away from the value the rest of the design system uses — the hero would
	be a slightly different blue from every other accent.
-->
<Canvas dpr={[1, 1.75]} toneMapping={NoToneMapping} renderMode="on-demand">
	<ApertureField {tier} {rows} />
</Canvas>
