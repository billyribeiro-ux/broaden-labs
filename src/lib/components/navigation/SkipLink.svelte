<script lang="ts">
	/**
	 * Skip navigation. Brief §83.
	 *
	 * Visually hidden until focused, never `display: none` — a hidden-by-display
	 * link is removed from the tab order entirely, which defeats the purpose.
	 */
</script>

<a class="skip-link" href="#main">Skip to content</a>

<style>
	.skip-link {
		position: absolute;
		inset-block-start: var(--space-sm);
		inset-inline-start: var(--space-sm);
		z-index: var(--z-skip-link);

		padding-block: var(--space-2xs);
		padding-inline: var(--space-sm);

		font-family: var(--font-mono);
		font-size: var(--text-sm);
		letter-spacing: var(--tracking-wide);
		text-decoration: none;

		color: var(--on-accent);
		background-color: var(--accent);
		border-radius: var(--radius-xs);

		/* Moved out of view rather than hidden, so it keeps its place in the tab
		   order and animates back in on focus. */
		transform: translateY(calc(-100% - var(--space-lg)));
		transition: transform var(--dur-fast) var(--ease-entrance);
	}

	.skip-link:focus-visible {
		transform: translateY(0);
	}
</style>
