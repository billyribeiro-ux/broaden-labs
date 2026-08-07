<script lang="ts">
	/**
	 * The no-WebGL composition. Brief §75.
	 *
	 * This is what the SERVER renders, always — see capability.svelte.ts for why
	 * the tier starts at `fallback`. So this is not a degraded afterthought: it
	 * is the first thing every visitor sees, and for anyone without WebGL it is
	 * the only thing.
	 *
	 * It expresses the same idea as the 3D scene — a constrained field opening
	 * into depth — using the one technique SVG does better than WebGL: exact
	 * hairlines. Geometry is derived from indices, never random, so the server
	 * and client emit byte-identical markup (brief §76).
	 *
	 * Decorative: the hero's meaning is entirely in the headline and copy beside
	 * it, so this carries aria-hidden and contributes nothing to the page's
	 * accessible content. Brief §83 — no meaningful information inside a canvas,
	 * and the same rule applies to its stand-in.
	 */
	interface Props {
		/** Rows drawn. Matches the tier so the fallback and scene agree in density. */
		rows?: number;
	}

	let { rows = 8 }: Props = $props();

	const COLUMNS = 12;

	/**
	 * The same layout the shader uses: column and row from the instance index,
	 * with depth expressed as horizontal offset and opacity rather than
	 * perspective. A 2D medium cannot fake a camera, so it does not try.
	 */
	const plates = $derived(
		Array.from({ length: COLUMNS * rows }, (_, index) => {
			const column = index % COLUMNS;
			const row = Math.floor(index / COLUMNS);
			const depth = row / Math.max(rows - 1, 1);

			return {
				key: `${column}-${row}`,
				x: 40 + column * 74 + depth * 26,
				y: 40 + row * 62 + depth * 8,
				width: 58 - depth * 10,
				height: 44 - depth * 8,
				opacity: 0.55 - depth * 0.42
			};
		})
	);
</script>

<svg
	class="fallback"
	viewBox="0 0 1000 620"
	preserveAspectRatio="xMidYMid slice"
	aria-hidden="true"
	focusable="false"
>
	{#each plates as plate (plate.key)}
		<rect
			x={plate.x}
			y={plate.y}
			width={plate.width}
			height={plate.height}
			opacity={plate.opacity}
		/>
	{/each}
</svg>

<style>
	.fallback {
		display: block;
		inline-size: 100%;
		block-size: 100%;
	}

	rect {
		fill: none;
		stroke: var(--azurite-300);
		/*
		 * vector-effect keeps the stroke at exactly one device pixel however the
		 * viewBox is scaled — the same property the Aperture motif relies on, and
		 * the reason this reads as a drawing rather than a diagram.
		 */
		vector-effect: non-scaling-stroke;
		stroke-width: 1;
	}
</style>
