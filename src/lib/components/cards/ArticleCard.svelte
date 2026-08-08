<script lang="ts">
	import type { Insight } from '#lib/content/schema';

	interface Props {
		insight: Insight;
		/**
		 * See ProjectCard for the full reasoning. On /insights the cards follow the
		 * <h1> with no section heading between them, so they are that page's
		 * top-level sections and must be <h2>. Everywhere else they sit under a
		 * section <h2> and <h3> is correct.
		 */
		headingLevel?: 2 | 3;
	}

	let { insight, headingLevel = 3 }: Props = $props();

	// Intl rather than a hand-built format. A regex over a formatted date string
	// is how a date becomes "20-3341".
	const published = $derived(
		new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(new Date(insight.published))
	);
</script>

<a class="card" href="/insights/{insight.slug}">
	<p class="meta">
		<span class="category">{insight.category}</span>
		<span class="dot" aria-hidden="true">·</span>
		<time datetime={insight.published}>{published}</time>
		<span class="dot" aria-hidden="true">·</span>
		<span>{insight.readingMinutes} min read</span>
	</p>
	<svelte:element this={`h${headingLevel}`} class="title">{insight.title}</svelte:element>
	<p class="dek">{insight.dek}</p>
</a>

<style>
	.card {
		display: grid;
		gap: var(--space-2xs);
		padding-block: var(--space-lg);
		text-decoration: none;
		color: var(--text-primary);
		border-block-start: var(--border-hairline) solid var(--border-subtle);
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2xs);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		color: var(--text-muted);
	}

	.category {
		color: var(--accent);
	}

	.title {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: var(--weight-display);
		line-height: var(--lh-heading);
		letter-spacing: var(--tracking-heading);
		text-wrap: balance;
	}

	.card:hover .title {
		text-decoration: underline;
		text-underline-offset: 0.18em;
	}

	.dek {
		max-inline-size: 62ch;
		font-size: var(--text-base);
		color: var(--text-secondary);
	}
</style>
