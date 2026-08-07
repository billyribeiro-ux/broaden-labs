<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * Large editorial headings.
	 *
	 * `level` and `size` are separate props on purpose. The heading LEVEL is a
	 * document-structure decision that a screen reader depends on; the SIZE is an
	 * art-direction decision. Conflating them is how sites end up with an <h4>
	 * chosen because it looked right, and a broken outline.
	 */
	type Level = 1 | 2 | 3 | 4;
	type Size = 'mega' | 'hero' | 'lg' | 'md' | 'sm' | 'xl';

	interface Props {
		children: Snippet;
		level?: Level;
		size?: Size;
		/** Caps the line length so long headings break where they should. */
		measure?: boolean;
		id?: string;
	}

	let { children, level = 2, size = 'md', measure = true, id }: Props = $props();
</script>

<svelte:element this={`h${level}`} {id} class="display" data-size={size} class:measure>
	{@render children()}
</svelte:element>

<style>
	.display {
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		color: var(--text-primary);
		text-wrap: balance;
	}

	.measure {
		max-inline-size: var(--measure-display);
	}

	/* Tracking tightens as size grows: the same optical spacing at 240px would
	   read as gappy, and at 40px the mega tracking would collide the counters. */
	.display[data-size='mega'] {
		font-size: var(--display-mega);
		line-height: var(--lh-display);
		letter-spacing: var(--tracking-mega);
	}

	.display[data-size='hero'] {
		font-size: var(--display-hero);
		line-height: var(--lh-display);
		letter-spacing: var(--tracking-mega);
	}

	.display[data-size='lg'] {
		font-size: var(--display-lg);
		line-height: var(--lh-tight);
		letter-spacing: var(--tracking-display);
	}

	.display[data-size='md'] {
		font-size: var(--display-md);
		line-height: var(--lh-tight);
		letter-spacing: var(--tracking-display);
	}

	.display[data-size='sm'] {
		font-size: var(--display-sm);
		line-height: var(--lh-tight);
		letter-spacing: var(--tracking-display);
	}

	.display[data-size='xl'] {
		font-size: var(--text-4xl);
		line-height: var(--lh-heading);
		letter-spacing: var(--tracking-heading);
	}
</style>
