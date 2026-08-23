<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * The small mono label that opens a section — "SELECTED WORK", "HOW WE THINK".
	 *
	 * It is NOT a heading element. An eyebrow above an <h2> is a label for that
	 * heading, not a level of its own, and marking it up as one would produce a
	 * broken outline where every section has two headings.
	 */
	interface Props {
		children: Snippet;
		/** Renders the aperture tick before the label. */
		marked?: boolean;
	}

	let { children, marked = true }: Props = $props();
</script>

<p class="eyebrow" class:marked>
	{#if marked}<span class="tick" aria-hidden="true"></span>{/if}
	{@render children()}
</p>

<style>
	.eyebrow {
		display: flex;
		/*
		 * `flex-start`, NOT `center`, and the tick is nudged onto the first line
		 * below instead.
		 *
		 * The label is a bare text node, so it is an anonymous flex item that wraps
		 * internally once it runs out of room — and it does, on every phone. The
		 * longest one on the site, "Software • Platforms • Digital Experiences", is
		 * mono at --text-xs with 0.16em of tracking, which measures ~374px against
		 * the ~248-316px a 320-414px viewport leaves after gutters, tick and gap.
		 *
		 * With `center` the 24px tick was then centred on the whole TWO-LINE block,
		 * so the aperture motif floated in the gap between the lines rather than
		 * marking the label. Measured on production at 320/360/390/414: eyebrow
		 * 24px tall, tick 12px from its top — dead centre, between both lines. At
		 * 768 and above it is one line and 6px, which is why this only ever looked
		 * right on desktop.
		 */
		align-items: flex-start;
		gap: var(--space-xs);

		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-eyebrow);
		line-height: var(--lh-flat);
		text-transform: uppercase;
		color: var(--text-muted);
	}

	/* The smallest expression of the aperture motif: a fixed 24px hairline that
	   does not animate here. Section-level instances animate; a label does not,
	   or the motif becomes noise. */
	.tick {
		inline-size: 24px;
		block-size: 1px;
		flex: none;
		background-color: var(--accent);
		/*
		 * Centres the hairline on the FIRST line box, whatever the label does after
		 * it. `--lh-flat` is 1, so a line box is exactly 1em and its centre is
		 * 0.5em down; the extra half pixel accounts for the tick's own 1px height.
		 * `em` resolves against the inherited --text-xs, so this tracks the fluid
		 * type scale without a second clamp.
		 *
		 * On a single-line eyebrow this lands within half a pixel of where
		 * `align-items: center` used to put it, so desktop is unchanged.
		 */
		margin-block-start: calc(0.5em - 0.5px);
	}
</style>
