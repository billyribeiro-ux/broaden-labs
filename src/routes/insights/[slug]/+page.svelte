<script lang="ts">
	import Eyebrow from '#lib/components/typography/Eyebrow.svelte';
	import DisplayHeading from '#lib/components/typography/DisplayHeading.svelte';
	import Button from '#lib/components/buttons/Button.svelte';
	import ArticleCard from '#lib/components/cards/ArticleCard.svelte';
	import Aperture from '#lib/components/motion/Aperture.svelte';
	import type { PageProps } from './$types';
	import Seo from '#lib/components/seo/Seo.svelte';

	/**
	 * Article template. Brief §57.
	 *
	 * The body is a typed discriminated union rather than a markdown string, so
	 * each block renders as the right element with the right semantics — a table
	 * keeps its <caption>, a callout gets a role, and code is not a <div> with a
	 * monospace font. Parsing markdown would have thrown all three away.
	 */
	let { data }: PageProps = $props();

	const insight = $derived(data.insight);

	const published = $derived(
		new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(new Date(insight.published))
	);
</script>

<Seo
	title="{insight.title} — Broaden Labs"
	description={insight.dek}
	image="/og/insights-{insight.slug}.png"
	kind="article"
	published={insight.published}
	author={insight.author}
	breadcrumbs={[
		{ name: 'Insights', href: '/insights' },
		{ name: insight.title, href: `/insights/${insight.slug}` }
	]}
/>

<article>
	<header class="section section--tight">
		<div class="container container--prose">
			<Eyebrow>{insight.category}</Eyebrow>
			<DisplayHeading level={1} size="md" measure={false}>{insight.title}</DisplayHeading>
			<p class="dek">{insight.dek}</p>
			<p class="byline">
				<span>{insight.author}</span>
				<span class="sep" aria-hidden="true">·</span>
				<time datetime={insight.published}>{published}</time>
				<span class="sep" aria-hidden="true">·</span>
				<span>{insight.readingMinutes} min read</span>
			</p>
		</div>
	</header>

	<div class="section section--flush-top">
		<div class="container container--prose">
			<Aperture mode="rule" />

			<div class="body">
				{#each insight.body as block, index (index)}
					{#if block.type === 'p'}
						<p>{block.text}</p>
					{:else if block.type === 'h2'}
						<h2>{block.text}</h2>
					{:else if block.type === 'callout'}
						<!-- A note, not an alert: role="note" is correct here and role="alert"
						     would interrupt a screen reader mid-article for prose. -->
						<aside class="callout" role="note">
							<p>{block.text}</p>
						</aside>
					{:else if block.type === 'list'}
						<ul role="list">
							{#each block.items as item (item)}
								<li>{item}</li>
							{/each}
						</ul>
					{:else if block.type === 'code'}
						<figure class="code">
							<!--
								tabindex + role + label on the SCROLLING element, not the figure.
								`overflow-x: auto` creates a region a mouse can pan and a keyboard
								cannot reach at all — axe flags it as scrollable-region-focusable,
								and it is a real SC 2.1.1 failure, not a lint nit. Making it
								focusable gives it to the keyboard; the label stops it being an
								unnamed stop in the tab order.
							     Svelte's a11y_no_noninteractive_tabindex fires here and axe's
								scrollable-region-focusable fires if we remove it. They cannot both
								be satisfied: WCAG SC 2.1.1 requires the scroll region be operable
								by keyboard, so the linter is the one that yields.
							-->
							<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
							<pre tabindex="0" role="region" aria-label="{block.language} code sample"><code
									>{block.code}</code
								></pre>
							<figcaption>{block.language}</figcaption>
						</figure>
					{:else if block.type === 'table'}
						<!-- Same reason as the code block: this scrolls horizontally on a
						     narrow viewport, so it must be reachable by keyboard. The caption
						     names it, so aria-labelledby points at that rather than repeating
						     the text in an aria-label.

						     Same linter-vs-axe conflict as the code block above; WCAG wins. -->
						<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
						<figure class="table" tabindex="0" role="region" aria-label="Table: {block.caption}">
							<table>
								<caption>{block.caption}</caption>
								<thead>
									<tr>
										{#each block.head as heading (heading)}
											<th scope="col">{heading}</th>
										{/each}
									</tr>
								</thead>
								<tbody>
									{#each block.rows as row, rowIndex (rowIndex)}
										<tr>
											{#each row as cell, cellIndex (cellIndex)}
												{#if cellIndex === 0}
													<th scope="row">{cell}</th>
												{:else}
													<td>{cell}</td>
												{/if}
											{/each}
										</tr>
									{/each}
								</tbody>
							</table>
						</figure>
					{/if}
				{/each}
			</div>
		</div>
	</div>

	{#if data.related.length > 0}
		<section class="section">
			<div class="container container--prose">
				<Eyebrow>Related reading</Eyebrow>
				<ul class="related" role="list">
					{#each data.related as related (related.slug)}
						<li><ArticleCard insight={related} /></li>
					{/each}
				</ul>
			</div>
		</section>
	{/if}

	<section class="section section--tight cta">
		<div class="container container--prose">
			<DisplayHeading size="sm" measure={false}>
				Working on something this applies to?
			</DisplayHeading>
			<div class="cta-actions">
				<Button href="/start-a-project">Start a project</Button>
				<Button href="/insights" variant="secondary" arrow={false}>All insights</Button>
			</div>
		</div>
	</section>
</article>

<style>
	.dek {
		margin-block-start: var(--space-sm);
		font-size: var(--text-xl);
		line-height: var(--lh-relaxed);
		color: var(--text-secondary);
		text-wrap: balance;
	}

	.byline {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2xs);
		margin-block-start: var(--space-md);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		color: var(--text-muted);
	}

	.body {
		margin-block-start: var(--space-xl);
		font-size: var(--text-lg);
		line-height: var(--lh-relaxed);
		color: var(--text-secondary);
	}

	.body > * + * {
		margin-block-start: var(--space-md);
	}

	.body :global(h2) {
		margin-block-start: var(--space-2xl);
		font-size: var(--text-2xl);
		color: var(--text-primary);
	}

	.body ul {
		display: grid;
		gap: var(--space-2xs);
		padding-inline-start: 0;
	}

	.body li {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-sm);
	}

	.body li::before {
		content: '';
		inline-size: 16px;
		block-size: 1px;
		margin-block-start: 0.8em;
		background-color: var(--accent);
	}

	.callout {
		padding: var(--space-md);
		border-inline-start: var(--border-thick) solid var(--accent);
		background-color: var(--surface-secondary);
	}

	.callout p {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
		line-height: var(--lh-heading);
		letter-spacing: var(--tracking-heading);
		color: var(--text-primary);
		text-wrap: balance;
	}

	.code {
		margin: 0;
		border: var(--border-hairline) solid var(--border-subtle);
		background-color: var(--surface-inset);
	}

	.code pre {
		margin: 0;
		padding: var(--space-md);
		overflow-x: auto;
		font-size: var(--text-sm);
		line-height: var(--lh-body);
		color: var(--text-primary);
	}

	.code figcaption {
		padding-inline: var(--space-md);
		padding-block: var(--space-2xs);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-eyebrow);
		text-transform: uppercase;
		color: var(--text-muted);
		border-block-start: var(--border-hairline) solid var(--border-subtle);
	}

	.table {
		margin: 0;
		overflow-x: auto;
	}

	table {
		inline-size: 100%;
		border-collapse: collapse;
		font-size: var(--text-sm);
	}

	caption {
		padding-block-end: var(--space-2xs);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		text-align: start;
		color: var(--text-muted);
	}

	th,
	td {
		padding-block: var(--space-2xs);
		padding-inline-end: var(--space-md);
		text-align: start;
		vertical-align: top;
		border-block-end: var(--border-hairline) solid var(--border-subtle);
	}

	thead th {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--text-muted);
	}

	tbody th {
		font-weight: var(--weight-semibold);
		color: var(--text-primary);
	}

	.related {
		display: grid;
		margin-block-start: var(--space-sm);
	}

	.cta .container {
		display: grid;
		gap: var(--space-md);
		justify-items: start;
	}

	.cta-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}
</style>
