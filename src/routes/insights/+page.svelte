<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Eyebrow from '#lib/components/typography/Eyebrow.svelte';
	import DisplayHeading from '#lib/components/typography/DisplayHeading.svelte';
	import ArticleCard from '#lib/components/cards/ArticleCard.svelte';
	import { INSIGHTS, INSIGHT_CATEGORIES } from '#lib/content/insights';
	import Seo from '#lib/components/seo/Seo.svelte';

	/**
	 * Insights index. Same URL-state approach as /work: the category is in the
	 * query string, the controls are real links, and the filtered list is
	 * server-rendered so it is correct without JavaScript.
	 */
	const activeCategory = $derived(page.url.searchParams.get('category'));

	const filtered = $derived(
		activeCategory ? INSIGHTS.filter((insight) => insight.category === activeCategory) : INSIGHTS
	);

	function categoryHref(value: string | null): string {
		if (value === null || activeCategory === value) return '/insights';
		return `/insights?category=${encodeURIComponent(value)}`;
	}

	function applyFilter(event: MouseEvent, href: string) {
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
		event.preventDefault();
		void goto(href, { reset: false });
	}
</script>

<Seo
	title="Insights — Broaden Labs"
	description="Notes from Broaden on software architecture, product design, real-time systems, AI, engineering, performance, and building digital products that can keep changing."
	image="/og/insights.png"
	breadcrumbs={[{ name: 'Insights', href: '/insights' }]}
/>

<section class="section section--tight">
	<div class="container">
		<div class="grid">
			<div class="span-8-4 intro">
				<Eyebrow>Insights</Eyebrow>
				<DisplayHeading level={1} size="lg" measure={false}>
					Thinking about products, systems, and the decisions between them.
				</DisplayHeading>
				<p class="lede">
					Notes from Broaden on software architecture, product design, real-time systems, AI,
					engineering, performance, and building digital products that can keep changing.
				</p>
			</div>
		</div>
	</div>
</section>

<section class="section section--flush-top">
	<div class="container">
		<nav class="filters" aria-label="Filter by category">
			<a
				href="/insights"
				class="chip"
				class:active={!activeCategory}
				aria-current={!activeCategory ? 'true' : undefined}
				onclick={(event) => applyFilter(event, '/insights')}
			>
				All
			</a>
			{#each INSIGHT_CATEGORIES as category (category)}
				{@const href = categoryHref(category)}
				<a
					{href}
					class="chip"
					class:active={activeCategory === category}
					aria-current={activeCategory === category ? 'true' : undefined}
					onclick={(event) => applyFilter(event, href)}
				>
					{category}
				</a>
			{/each}
		</nav>

		<p class="count" aria-live="polite">
			{filtered.length}
			{filtered.length === 1 ? 'note' : 'notes'}
		</p>

		{#if filtered.length > 0}
			<ul class="articles" role="list">
				{#each filtered as insight (insight.slug)}
					<li><ArticleCard {insight} /></li>
				{/each}
			</ul>
		{:else}
			<div class="empty">
				<h2>No notes in this category yet.</h2>
				<p>Everything else is still here.</p>
				<a class="reset" href="/insights" onclick={(event) => applyFilter(event, '/insights')}>
					Show all notes
				</a>
			</div>
		{/if}
	</div>
</section>

<style>
	.intro {
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

	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2xs);
		padding-block-end: var(--space-lg);
		border-block-end: var(--border-hairline) solid var(--border-subtle);
	}

	.chip {
		display: inline-flex;
		align-items: center;
		min-block-size: 32px;
		padding-inline: 0.85em;
		font-size: var(--text-sm);
		text-decoration: none;
		color: var(--text-secondary);
		border: var(--border-hairline) solid var(--border-subtle);
		border-radius: var(--radius-pill);
		transition:
			color var(--dur-instant) var(--ease-exit),
			border-color var(--dur-instant) var(--ease-exit),
			background-color var(--dur-instant) var(--ease-exit);
	}

	.chip:hover {
		color: var(--text-primary);
		border-color: var(--border-strong);
		transition-duration: var(--dur-fast);
		transition-timing-function: var(--ease-entrance);
	}

	.chip.active {
		color: var(--on-accent);
		background-color: var(--accent);
		border-color: var(--accent);
	}

	.count {
		padding-block: var(--space-md);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		color: var(--text-muted);
	}

	.articles {
		display: grid;
		margin: 0;
	}

	.empty {
		display: grid;
		gap: var(--space-2xs);
		justify-items: start;
		padding-block: var(--space-3xl);
	}

	.empty h2 {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: var(--weight-display);
		letter-spacing: var(--tracking-heading);
	}

	.empty p {
		color: var(--text-secondary);
	}

	.reset {
		margin-block-start: var(--space-2xs);
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		color: var(--accent);
	}
</style>
