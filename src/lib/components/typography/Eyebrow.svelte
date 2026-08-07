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
		align-items: center;
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
	}
</style>
