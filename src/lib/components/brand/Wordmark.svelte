<script lang="ts">
	/**
	 * The BROADEN wordmark. Brief §107.
	 *
	 * Typographic, not an invented icon — "do not invent a complicated logo icon
	 * merely to fill space". It is a single component so that when a final SVG
	 * logo is supplied it replaces this file's contents and nothing in the
	 * header, footer or menu has to change.
	 *
	 * Rendered as text rather than an <svg> so it inherits the type system, stays
	 * selectable, and is read correctly by a screen reader without an aria-label.
	 */
	interface Props {
		/** Adds the "LABS" descriptor. Used in the footer, not the header. */
		descriptor?: boolean;
		/** Renders as a <span> for use inside an existing link. */
		as?: 'div' | 'span';
		size?: 'sm' | 'md' | 'lg';
	}

	let { descriptor = false, as = 'div', size = 'md' }: Props = $props();
</script>

<svelte:element this={as} class="wordmark" data-size={size}>
	<span class="mark">BROADEN</span>
	{#if descriptor}
		<span class="descriptor">LABS</span>
	{/if}
</svelte:element>

<style>
	.wordmark {
		display: inline-flex;
		align-items: baseline;
		gap: 0.55em;
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		line-height: var(--lh-flat);
		color: var(--text-primary);
	}

	.mark {
		/* Tracking is positive here and negative on display headings on purpose:
		   at wordmark size the letters are small enough that the tight display
		   tracking closes the counters up. */
		letter-spacing: 0.04em;
		font-variation-settings: 'opsz' 96;
	}

	.descriptor {
		font-family: var(--font-mono);
		font-weight: var(--weight-medium);
		font-size: 0.42em;
		letter-spacing: var(--tracking-eyebrow);
		color: var(--text-muted);
		/* Optically aligns the mono descriptor with the display baseline; the two
		   families do not share a baseline-to-cap ratio. */
		transform: translateY(-0.15em);
	}

	.wordmark[data-size='sm'] {
		font-size: var(--text-base);
	}

	.wordmark[data-size='md'] {
		font-size: var(--text-xl);
	}

	.wordmark[data-size='lg'] {
		font-size: var(--text-3xl);
	}
</style>
