<script lang="ts">
	/**
	 * The BROADEN signature motif. Brief §112.
	 *
	 * One 1px hairline in six declared modes, driven by one number.
	 *
	 * It is an inline <svg> rather than a <div> with a border because of
	 * `vector-effect="non-scaling-stroke"`: that attribute lets the line be
	 * scaled by an arbitrary transform and stay exactly one device pixel thick.
	 * A scaled border becomes a fat smear. That single attribute is what makes
	 * the whole motif possible on one composited transform, with no per-frame JS
	 * and no layout work.
	 *
	 * M3 renders the resting state. M5 drives `--aperture` from ScrollTrigger.
	 */
	type Mode = 'rule' | 'bracket' | 'connector' | 'scale' | 'underline' | 'gate';

	interface Props {
		mode?: Mode;
		/** 0 → 1. Static here; scroll-driven from M5. */
		extent?: number;
	}

	let { mode = 'rule', extent = 1 }: Props = $props();
</script>

<svg
	class="aperture"
	data-mode={mode}
	style="--aperture: {extent}"
	viewBox="0 0 1000 8"
	preserveAspectRatio="none"
	aria-hidden="true"
	focusable="false"
>
	<line class="rule" x1="0" y1="4" x2="1000" y2="4" vector-effect="non-scaling-stroke" />
	{#if mode === 'bracket'}
		<line class="tick" x1="0.5" y1="0" x2="0.5" y2="8" vector-effect="non-scaling-stroke" />
		<line class="tick" x1="999.5" y1="0" x2="999.5" y2="8" vector-effect="non-scaling-stroke" />
	{/if}
	{#if mode === 'connector'}
		<circle class="dot" cx="997" cy="4" r="3" />
	{/if}
	{#if mode === 'scale'}
		{#each [200, 400, 600, 800] as x (x)}
			<line class="tick" x1={x} y1="1" x2={x} y2="7" vector-effect="non-scaling-stroke" />
		{/each}
	{/if}
</svg>

<style>
	.aperture {
		display: block;
		inline-size: 100%;
		block-size: 8px;
		overflow: visible;
		stroke: var(--rule);
		stroke-width: 1;
	}

	.rule {
		transform: scaleX(var(--aperture, 1));
		transition: transform var(--dur-cinematic) var(--ease-inertial);
	}

	.tick,
	.dot {
		opacity: var(--aperture, 1);
		transition: opacity var(--dur-base) var(--ease-entrance);
	}

	.dot {
		fill: var(--accent);
		stroke: none;
	}

	/* Each mode has its own origin, which is what stops the motif reading as the
	   same animation repeated: the line grows from a different edge each time. */
	.aperture[data-mode='rule'] .rule {
		transform-origin: 0 50%;
	}
	.aperture[data-mode='bracket'] .rule {
		transform-origin: 50% 50%;
	}
	.aperture[data-mode='connector'] .rule {
		transform-origin: 100% 50%;
	}
	.aperture[data-mode='scale'] .rule {
		transform-origin: 0 50%;
	}
	.aperture[data-mode='underline'] .rule,
	.aperture[data-mode='gate'] .rule {
		stroke: var(--accent);
	}
	.aperture[data-mode='underline'] .rule {
		transform-origin: 0 50%;
	}
	.aperture[data-mode='gate'] .rule {
		transform-origin: 50% 50%;
	}
</style>
