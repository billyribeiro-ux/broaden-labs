<script lang="ts">
	import type { CaseStudy } from '#lib/content/schema';

	/**
	 * Abstract product-interface fixtures. Brief §108, §109.
	 *
	 * Every case study renders one of six SVG compositions authored here. They
	 * are NOT screenshots and NOT stock imagery — §108 requires that every
	 * fixture asset be "clearly licensable because we generated it ourselves".
	 *
	 * Each is an inline <svg> with a viewBox, which means it is intrinsically
	 * sized and reserves its box before paint: no image request, no decode, and
	 * structurally no CLS. Geometry is derived from the index, never random, so
	 * server and client render identically (brief §76).
	 *
	 * Decorative by definition — the case study's meaning is in its prose, so
	 * these carry aria-hidden and contribute nothing to the accessible name.
	 */
	interface Props {
		surface: CaseStudy['surface'];
		/** Stable per-card variation without randomness. */
		seed?: number;
	}

	let { surface, seed = 0 }: Props = $props();

	// A deterministic pseudo-random sequence: same input, same output, on both
	// server and client. Math.random() here would be a hydration mismatch.
	function jitter(index: number, spread: number): number {
		const value = Math.sin((index + 1) * (seed + 2) * 12.9898) * 43758.5453;
		return (value - Math.floor(value)) * spread;
	}

	const rows = $derived(Array.from({ length: 7 }, (_, i) => i));
	const columns = $derived(Array.from({ length: 12 }, (_, i) => i));
</script>

<svg
	class="surface"
	data-surface-kind={surface}
	viewBox="0 0 480 300"
	preserveAspectRatio="xMidYMid slice"
	aria-hidden="true"
	focusable="false"
>
	<rect class="field" width="480" height="300" />

	<!-- Chrome: every fixture reads as an application frame, which is what makes
	     the set feel like one product family rather than six illustrations. -->
	<line class="hairline" x1="0" y1="28" x2="480" y2="28" />
	<rect class="chip" x="16" y="12" width="34" height="8" rx="1" />
	<rect class="chip dim" x="58" y="12" width="20" height="8" rx="1" />
	<rect class="chip dim" x="86" y="12" width="20" height="8" rx="1" />

	{#if surface === 'command-center'}
		<!-- Dense multi-pane monitoring: many small live regions at once. -->
		<line class="hairline" x1="150" y1="28" x2="150" y2="300" />
		<line class="hairline" x1="330" y1="28" x2="330" y2="300" />
		{#each rows as row (row)}
			<rect
				class="chip dim"
				x="16"
				y={44 + row * 22}
				width={70 + jitter(row, 50)}
				height="6"
				rx="1"
			/>
			<rect
				class="chip accent"
				x={16 + 100}
				y={44 + row * 22}
				width={10 + jitter(row + 3, 22)}
				height="6"
				rx="1"
			/>
		{/each}
		<polyline
			class="trace"
			points={columns.map((c) => `${162 + c * 14},${240 - jitter(c, 90)}`).join(' ')}
		/>
		{#each rows.slice(0, 5) as row (row)}
			<rect
				class="chip dim"
				x="344"
				y={44 + row * 26}
				width={60 + jitter(row + 7, 60)}
				height="6"
				rx="1"
			/>
		{/each}
	{:else if surface === 'operational-queue'}
		<!-- One authoritative ordered list: priority is the whole interface. -->
		{#each rows as row (row)}
			<rect class="row" x="16" y={40 + row * 34} width="448" height="26" rx="1" />
			<rect class="chip accent" x="24" y={49 + row * 34} width="4" height="8" rx="1" />
			<rect class="chip" x="38" y={49 + row * 34} width={90 + jitter(row, 70)} height="8" rx="1" />
			<rect
				class="chip dim"
				x="330"
				y={49 + row * 34}
				width={40 + jitter(row + 2, 30)}
				height="8"
				rx="1"
			/>
		{/each}
	{:else if surface === 'purchasing-flow'}
		<!-- Progressive disclosure: a spine of steps, one expanded. -->
		{#each [0, 1, 2, 3] as step (step)}
			<circle class="node" cx="46" cy={64 + step * 62} r="6" />
			{#if step < 3}
				<line class="hairline" x1="46" y1={70 + step * 62} x2="46" y2={120 + step * 62} />
			{/if}
			<rect
				class="chip"
				x="70"
				y={60 + step * 62}
				width={110 + jitter(step, 60)}
				height="8"
				rx="1"
			/>
			{#if step === 1}
				<rect class="row" x="70" y={78 + step * 62} width="380" height="34" rx="1" />
				<rect class="chip dim" x="82" y={90 + step * 62} width="150" height="6" rx="1" />
				<rect class="chip accent" x="392" y={88 + step * 62} width="46" height="10" rx="1" />
			{/if}
		{/each}
	{:else if surface === 'spatial-grid'}
		<!-- Density, not markers: aggregates keep a large estate legible. -->
		{#each columns as col (col)}
			{#each rows as row (row)}
				{@const size = 3 + jitter(col * 7 + row, 7)}
				<rect
					class="cell"
					x={20 + col * 37}
					y={44 + row * 34}
					width={size}
					height={size}
					opacity={0.25 + jitter(col + row * 3, 0.7)}
				/>
			{/each}
		{/each}
		<circle class="halo" cx="196" cy="150" r="52" />
		<circle class="node" cx="196" cy="150" r="5" />
	{:else if surface === 'workflow-console'}
		<!-- Five vocabularies collapsing into one domain model. -->
		{#each [0, 1, 2, 3, 4] as lane (lane)}
			<rect class="chip dim" x="16" y={48 + lane * 30} width="54" height="8" rx="1" />
			<line
				class="hairline"
				x1="78"
				y1={52 + lane * 30}
				x2={200 + jitter(lane, 40)}
				y2={52 + lane * 30}
			/>
			<circle class="node small" cx={200 + jitter(lane, 40)} cy={52 + lane * 30} r="3" />
		{/each}
		<line class="hairline accent-line" x1="300" y1="44" x2="300" y2="260" />
		{#each [0, 1, 2] as out (out)}
			<rect class="row" x="316" y={72 + out * 60} width="148" height="40" rx="1" />
			<rect
				class="chip"
				x="328"
				y={84 + out * 60}
				width={80 + jitter(out + 5, 40)}
				height="8"
				rx="1"
			/>
		{/each}
	{:else}
		<!-- control-surface: intent published before action. -->
		{#each rows.slice(0, 6) as row (row)}
			<rect class="row" x="16" y={42 + row * 40} width="448" height="32" rx="1" />
			<rect
				class="chip accent"
				x="28"
				y={54 + row * 40}
				width={6 + jitter(row, 30)}
				height="8"
				rx="1"
			/>
			<rect
				class="chip dim"
				x="90"
				y={54 + row * 40}
				width={120 + jitter(row + 4, 90)}
				height="8"
				rx="1"
			/>
			<rect class="chip dim" x="392" y={54 + row * 40} width="48" height="8" rx="1" />
		{/each}
	{/if}
</svg>

<style>
	.surface {
		display: block;
		inline-size: 100%;
		/* Reserves the box before paint. An aspect-ratio here rather than fixed
		   dimensions means the card can be fluid and still never shift. */
		aspect-ratio: 8 / 5;
		block-size: auto;
		background-color: var(--surface-inset);
	}

	.field {
		fill: var(--surface-inset);
	}

	.hairline {
		stroke: var(--border-subtle);
		stroke-width: 1;
	}

	.accent-line {
		stroke: var(--accent);
		opacity: 0.5;
	}

	.chip {
		fill: var(--text-secondary);
		opacity: 0.55;
	}

	.chip.dim {
		fill: var(--text-muted);
		opacity: 0.35;
	}

	.chip.accent {
		fill: var(--accent);
		opacity: 0.85;
	}

	.row {
		fill: var(--surface-elevated);
		stroke: var(--border-subtle);
		stroke-width: 1;
	}

	.trace {
		fill: none;
		stroke: var(--accent);
		stroke-width: 1.5;
		stroke-linejoin: round;
	}

	.cell {
		fill: var(--accent);
	}

	.node {
		fill: var(--accent);
	}

	.node.small {
		fill: var(--text-muted);
	}

	.halo {
		fill: none;
		stroke: var(--accent);
		stroke-width: 1;
		opacity: 0.35;
	}
</style>
