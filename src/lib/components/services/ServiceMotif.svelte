<script lang="ts">
	import type { Service } from '#lib/content/schema';

	/**
	 * Per-service art direction. Brief §40.
	 *
	 * Six distinct generated compositions so the detail pages are not one
	 * template with the nouns changed. Each motif is an argument about the
	 * service rather than decoration:
	 *
	 *   lattice          — a regular structure, built deliberately
	 *   strata           — layers that must hold weight added later
	 *   pulse            — a signal arriving, with intervals that matter
	 *   gradientless-flow— input routed through a decision, not a black box
	 *   substrate        — an old foundation with sections replaced in place
	 *   systemgrid       — one language, many components
	 *
	 * All geometry is derived from indices. No randomness, so server and client
	 * render byte-identically and there is no hydration mismatch (brief §76).
	 */
	interface Props {
		motif: Service['motif'];
	}

	let { motif }: Props = $props();

	const cols = Array.from({ length: 9 }, (_, i) => i);
	const rows = Array.from({ length: 6 }, (_, i) => i);
</script>

<svg
	class="motif"
	data-motif={motif}
	viewBox="0 0 360 260"
	preserveAspectRatio="xMidYMid meet"
	aria-hidden="true"
	focusable="false"
>
	{#if motif === 'lattice'}
		{#each cols as col (col)}
			<line class="hair" x1={20 + col * 40} y1="20" x2={20 + col * 40} y2="240" />
		{/each}
		{#each rows as row (row)}
			<line class="hair" x1="20" y1={20 + row * 44} x2="340" y2={20 + row * 44} />
		{/each}
		{#each rows as row (row)}
			<rect class="fill" x={20 + (row % 4) * 40} y={20 + row * 44} width="40" height="44" />
		{/each}
	{:else if motif === 'strata'}
		{#each rows as row (row)}
			<rect
				class="band"
				x={20 + row * 6}
				y={30 + row * 34}
				width={320 - row * 12}
				height="22"
				opacity={0.25 + row * 0.12}
			/>
		{/each}
		<line class="accent-hair" x1="20" y1="24" x2="340" y2="24" />
	{:else if motif === 'pulse'}
		<line class="hair" x1="20" y1="130" x2="340" y2="130" />
		{#each cols as col (col)}
			{@const height = col % 3 === 0 ? 56 : col % 2 === 0 ? 26 : 12}
			<line
				class={col % 3 === 0 ? 'accent-hair' : 'hair'}
				x1={24 + col * 39}
				y1={130 - height}
				x2={24 + col * 39}
				y2={130 + height}
			/>
		{/each}
		<circle class="dot" cx={24 + 6 * 39} cy="130" r="5" />
	{:else if motif === 'gradientless-flow'}
		{#each [0, 1, 2, 3] as lane (lane)}
			<line class="hair" x1="20" y1={50 + lane * 50} x2="150" y2={50 + lane * 50} />
			<line class="hair" x1="150" y1={50 + lane * 50} x2="180" y2="130" />
		{/each}
		<rect class="gate" x="180" y="106" width="48" height="48" />
		{#each [0, 1] as out (out)}
			<line class="accent-hair" x1="228" y1="130" x2="270" y2={90 + out * 80} />
			<line class="accent-hair" x1="270" y1={90 + out * 80} x2="340" y2={90 + out * 80} />
		{/each}
	{:else if motif === 'substrate'}
		{#each rows as row (row)}
			{#each cols.slice(0, 8) as col (col)}
				{@const replaced = (row + col) % 5 === 0}
				<rect
					class={replaced ? 'fill' : 'brick'}
					x={20 + col * 40}
					y={30 + row * 34}
					width="36"
					height="28"
				/>
			{/each}
		{/each}
	{:else}
		{#each rows as row (row)}
			{#each cols as col (col)}
				{@const size = 4 + ((row * 3 + col) % 4) * 3}
				<rect
					class={(row + col) % 7 === 0 ? 'fill' : 'brick'}
					x={20 + col * 38}
					y={30 + row * 36}
					width={size * 2}
					height={size * 2}
				/>
			{/each}
		{/each}
		<line class="accent-hair" x1="20" y1="20" x2="340" y2="20" />
		<line class="accent-hair" x1="20" y1="248" x2="340" y2="248" />
	{/if}
</svg>

<style>
	.motif {
		inline-size: 100%;
		/* Intrinsic box before paint — the motif sits beside the hero copy and a
		   late-sizing SVG here would shift the headline. */
		aspect-ratio: 360 / 260;
		block-size: auto;
	}

	.hair {
		stroke: var(--border-subtle);
		stroke-width: 1;
	}

	.accent-hair {
		stroke: var(--accent);
		stroke-width: 1;
		opacity: 0.75;
	}

	.fill {
		fill: var(--accent);
		opacity: 0.22;
	}

	.brick {
		fill: var(--text-muted);
		opacity: 0.14;
	}

	.band {
		fill: var(--accent);
	}

	.gate {
		fill: none;
		stroke: var(--accent);
		stroke-width: 1.5;
	}

	.dot {
		fill: var(--accent);
	}
</style>
