<script lang="ts">
	import type { Service } from '#lib/content/schema';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';

	interface Props {
		service: Service;
		/**
		 * The heading level is a PROP because the correct level depends on where the
		 * card sits, and a card cannot know that. On /work and /services the cards
		 * follow the <h1> with no section heading between, so they are that page's
		 * top-level sections and must be <h2>; on the homepage and the detail pages
		 * they sit under a section <h2>, so <h3> is right.
		 *
		 * Hard-coding <h3> shipped a real `heading-order` violation on /work that the
		 * axe E2E could not catch: axe tags that rule `best-practice`, not WCAG, so
		 * the suite's `wcag22aa` filter excluded it. Lighthouse found it. shell.e2e.ts
		 * now checks the rule explicitly.
		 */
		headingLevel?: 2 | 3;
	}

	let { service, headingLevel = 3 }: Props = $props();
</script>

<a class="card" href="/services/{service.slug}">
	<span class="number" aria-hidden="true">{service.number}</span>

	<svelte:element this={`h${headingLevel}`} class="headline">{service.cardHeadline}</svelte:element>
	<p class="copy">{service.cardCopy}</p>

	<ul class="capabilities" role="list">
		{#each service.capabilities as capability (capability)}
			<li>{capability}</li>
		{/each}
	</ul>

	<span class="more">
		Explore {service.name.toLowerCase()}
		<span class="arrow" aria-hidden="true"><ArrowRightIcon size="1em" weight="bold" /></span>
	</span>
</a>

<style>
	.card {
		display: grid;
		align-content: start;
		gap: var(--space-sm);
		padding: var(--space-lg);
		text-decoration: none;
		color: var(--text-primary);
		border: var(--border-hairline) solid var(--border-subtle);
		background-color: var(--surface-secondary);
		transition:
			border-color var(--dur-instant) var(--ease-exit),
			background-color var(--dur-instant) var(--ease-exit);
	}

	.card:hover {
		border-color: var(--border-strong);
		background-color: var(--surface-elevated);
		transition-duration: var(--dur-base);
		transition-timing-function: var(--ease-entrance);
	}

	.number {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-eyebrow);
		color: var(--accent);
	}

	.headline {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: var(--weight-display);
		line-height: var(--lh-heading);
		letter-spacing: var(--tracking-heading);
		text-wrap: balance;
	}

	.copy {
		font-size: var(--text-sm);
		line-height: var(--lh-relaxed);
		color: var(--text-secondary);
	}

	.capabilities {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2xs);
		margin: 0;
		padding: 0;
	}

	.capabilities li {
		padding-inline: 0.6em;
		padding-block: 0.25em;
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		color: var(--text-muted);
		border: var(--border-hairline) solid var(--border-subtle);
	}

	.more {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2xs);
		margin-block-start: var(--space-2xs);
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		color: var(--accent);
	}

	.arrow {
		display: inline-flex;
		transition: transform var(--dur-instant) var(--ease-exit);
	}

	.card:hover .arrow {
		transform: translateX(var(--dist-xs));
		transition-duration: var(--dur-fast);
		transition-timing-function: var(--ease-entrance);
	}
</style>
