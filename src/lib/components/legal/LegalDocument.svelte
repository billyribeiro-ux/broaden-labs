<script lang="ts">
	import type { Snippet } from 'svelte';
	import Eyebrow from '#lib/components/typography/Eyebrow.svelte';
	import DisplayHeading from '#lib/components/typography/DisplayHeading.svelte';
	import { LAST_UPDATED, LAST_UPDATED_LABEL } from '#lib/content/legal';

	/**
	 * Shared shell for /privacy, /terms and /accessibility.
	 *
	 * One component rather than three copies of the same prose styles, because
	 * three copies drift and legal documents that look different from each other
	 * read as if one of them was forgotten.
	 *
	 * The `<time datetime>` is machine-readable on purpose: "last updated" is the
	 * one date on a legal page a reader actually needs to trust.
	 */
	interface Props {
		eyebrow: string;
		title: string;
		lede: string;
		children: Snippet;
	}

	let { eyebrow, title, lede, children }: Props = $props();
</script>

<section class="section">
	<div class="container">
		<div class="grid">
			<div class="span-8-4 head">
				<Eyebrow>{eyebrow}</Eyebrow>
				<DisplayHeading level={1} size="md">{title}</DisplayHeading>
				<p class="lede">{lede}</p>
				<p class="updated">
					Last updated <time datetime={LAST_UPDATED}>{LAST_UPDATED_LABEL}</time>
				</p>
			</div>
		</div>

		<div class="grid">
			<div class="span-8-4 prose">
				{@render children()}
			</div>
		</div>
	</div>
</section>

<style>
	.head {
		display: grid;
		gap: var(--space-md);
		justify-items: start;
	}

	.lede {
		max-inline-size: var(--measure-lede);
		font-size: var(--text-lg);
		line-height: var(--lh-relaxed);
		color: var(--text-secondary);
	}

	.updated {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		color: var(--text-muted);
	}

	/*
	 * Descendant selectors on purpose: the content is passed in as a snippet, so
	 * Svelte's scoping cannot reach those elements from the parent's own markup.
	 * `:global` is confined to inside `.prose`, never leaked to the document.
	 */
	.prose {
		margin-block-start: var(--space-2xl);
		display: grid;
		gap: var(--space-lg);
		/* Legal text is read, not scanned — a tighter measure than the lede. */
		max-inline-size: var(--measure-prose);
	}

	.prose :global(h2) {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		line-height: var(--lh-tight);
		color: var(--text-primary);
		margin-block-start: var(--space-md);
	}

	.prose :global(h3) {
		font-size: var(--text-md);
		line-height: var(--lh-snug);
		color: var(--text-primary);
	}

	.prose :global(p),
	.prose :global(li) {
		font-size: var(--text-base);
		line-height: var(--lh-relaxed);
		color: var(--text-secondary);
	}

	.prose :global(ul) {
		display: grid;
		gap: var(--space-2xs);
		padding-inline-start: var(--space-md);
		list-style: disc;
	}

	.prose :global(a) {
		color: var(--accent);
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	.prose :global(a:hover) {
		color: var(--accent-hover);
	}

	.prose :global(table) {
		inline-size: 100%;
		border-collapse: collapse;
		font-size: var(--text-sm);
	}

	.prose :global(th),
	.prose :global(td) {
		text-align: start;
		padding: var(--space-2xs) var(--space-xs);
		border-block-end: var(--border-hairline) solid var(--border-subtle);
		color: var(--text-secondary);
	}

	.prose :global(th) {
		color: var(--text-primary);
		font-weight: 600;
	}
</style>
