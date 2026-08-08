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
	import { lazyAttach } from '#lib/animation/lazy';

	/**
	 * The scroll driver is reached through lazyAttach, not imported at the top of
	 * this file. Aperture appears on nearly every route, so a static import of
	 * motion.ts put GSAP into nearly every route's chunk.
	 */
	const scrollDriven = lazyAttach(async () => {
		const { apertureScroll } = await import('#lib/animation/motion');
		return apertureScroll();
	});

	type Mode = 'rule' | 'bracket' | 'connector' | 'scale' | 'underline' | 'gate';

	interface Props {
		mode?: Mode;
		/**
		 * Fixed extent. When omitted the motif is scroll-driven, which is the
		 * normal case; passing a value pins it (used where the line is structural
		 * rather than expressive, e.g. inside a card).
		 */
		extent?: number | undefined;
	}

	let { mode = 'rule', extent }: Props = $props();

	const driven = $derived(extent === undefined);
</script>

<!--
	The scroll driver is attached only when the extent is not pinned. An
	attachment re-runs when the state it reads changes, so `driven` is read here
	in the template rather than inside the attachment — the timeline is built
	once, not rebuilt on every scroll tick.
-->
<svg
	class="aperture"
	data-mode={mode}
	data-driven={driven ? 'true' : undefined}
	style={driven ? undefined : `--aperture: ${extent}`}
	{@attach driven ? scrollDriven : undefined}
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

	/*
	 * @property is Chrome 85 / Safari 16.4 / FIREFOX 128 — above the project's
	 * firefox114 build-target floor, so registration silently no-ops there.
	 * That is safe BECAUSE the visible motion is `transform: scaleX()`, which is
	 * universally animatable; the registration only buys typed interpolation for
	 * the terminator opacity. Nothing load-bearing depends on it.
	 */
	@property --aperture {
		syntax: '<number>';
		inherits: true;
		initial-value: 1;
	}

	.rule {
		transform: scaleX(var(--aperture, 1));
		/* Composited: one GPU quad, no layout, no paint, no per-frame JS. */
		transition: transform var(--dur-cinematic) var(--ease-inertial);
	}

	.tick,
	.dot {
		opacity: var(--aperture, 1);
		transition: opacity var(--dur-base) var(--ease-entrance);
	}

	/**
	 * A SCRUBBED instance gets no transition at all.
	 *
	 * motion.ts states the rule for apertureScroll: "an eased scrub reads as
	 * input lag rather than as polish". The transitions above were breaking it —
	 * ScrollTrigger writes `--aperture` every frame, each write re-targets the
	 * declaration below, and a 900ms ease-out restarting every frame means the
	 * drawn line trails the scroll instead of tracking it.
	 *
	 * Measured in Chromium 151 against this page, sampling `--aperture` on the
	 * <svg> and the computed `transform` of the line it drives on the same
	 * frame: --aperture reached 0.5946 and then held that exact value for
	 * thirteen consecutive frames, while the rendered scaleX crawled
	 * 0 → 0.4053 → 0.5250 → … → 0.5777 and had still not arrived. The hairline
	 * was roughly a quarter of a second behind the finger.
	 *
	 * The smoothing the motif actually wants is already there, in the right
	 * place: ScrollTrigger's own `scrub: 0.4`, which eases the VALUE toward the
	 * scroll position rather than easing each frame's paint. Removing the CSS
	 * transition leaves exactly one smoothing mechanism instead of two fighting.
	 *
	 * Every <Aperture> in the app is currently scroll-driven — no caller passes
	 * `extent` — so the transitions above are kept only for the pinned case they
	 * were written for, where the value changes discretely and an ease is right.
	 */
	.aperture[data-driven] .rule,
	.aperture[data-driven] .tick,
	.aperture[data-driven] .dot {
		transition: none;
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
