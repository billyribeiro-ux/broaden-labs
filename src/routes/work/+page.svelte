<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Eyebrow from '#lib/components/typography/Eyebrow.svelte';
	import DisplayHeading from '#lib/components/typography/DisplayHeading.svelte';
	import ProjectCard from '#lib/components/cards/ProjectCard.svelte';
	import { CASE_STUDIES } from '#lib/content/demo/case-studies';
	import type { Industry, Capability } from '#lib/content/schema';

	/**
	 * Work index with a working filter. Brief §33, §126.
	 *
	 * State lives in the URL, not in a component variable. That is what makes
	 * Back and Forward work, makes a filtered view shareable, and means the
	 * server renders the filtered result — so the list is correct before
	 * JavaScript arrives, and correct without it at all.
	 *
	 * The controls are <a> elements for the same reason: a filter that only
	 * responds to a click handler does not exist for a keyboard user with JS
	 * disabled. Each link is a real URL producing the state it describes; the
	 * click handler only upgrades the navigation so the page does not reload.
	 */
	const INDUSTRIES: readonly Industry[] = [
		'FinTech',
		'Healthcare',
		'SaaS',
		'Commerce',
		'Operations',
		'Emerging Tech'
	];

	const CAPABILITIES: readonly Capability[] = [
		'Product Engineering',
		'Real-Time',
		'AI',
		'Platform Modernization',
		'Product Design'
	];

	const activeIndustry = $derived(page.url.searchParams.get('industry'));
	const activeCapability = $derived(page.url.searchParams.get('capability'));

	const filtered = $derived(
		CASE_STUDIES.filter((study) => {
			if (activeIndustry && study.industry !== activeIndustry) return false;
			if (activeCapability && !study.capabilities.includes(activeCapability as Capability)) {
				return false;
			}
			return true;
		})
	);

	/** The URL a control navigates to, preserving the other dimension. */
	function filterHref(key: 'industry' | 'capability', value: string | null): string {
		// `page.url` is immutable at the type level in Kit 3, so its searchParams
		// is a ReadonlyURLSearchParams and cannot seed a mutable copy directly.
		// Constructing from the raw query string is the supported route.
		//
		// svelte/prefer-svelte-reactivity exists because a plain URLSearchParams
		// held in $state does not trigger updates. This one is function-local, is
		// read once on the next line, and is never stored — so the rule does not
		// apply. Reaching for SvelteURLSearchParams here would add a reactive
		// wrapper around a throwaway string builder, and hand-rolling the query
		// encoding instead would be worse than either.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const params = new URLSearchParams(page.url.search);
		if (value === null || params.get(key) === value) {
			params.delete(key);
		} else {
			params.set(key, value);
		}
		const query = params.toString();
		return query ? `/work?${query}` : '/work';
	}

	/**
	 * Push, not replace: §33 requires the filter to "support browser back/forward",
	 * which means each filter state needs its own history entry. Replacing would
	 * make Back leave the page entirely from the first selection.
	 *
	 * `noScroll` and `keepFocus` do not exist in Kit 3 — they collapsed into one
	 * `reset` boolean. `reset: false` preserves BOTH scroll position and focus,
	 * which is exactly what a filter needs: the list changes beneath you and the
	 * control you just pressed keeps focus.
	 *
	 * Modifier-clicks and middle-clicks fall through to the browser so
	 * open-in-new-tab still works.
	 */
	function applyFilter(event: MouseEvent, href: string) {
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
		event.preventDefault();
		void goto(href, { reset: false });
	}

	const hasFilters = $derived(Boolean(activeIndustry || activeCapability));
</script>

<svelte:head>
	<title>Work — Broaden Labs</title>
	<meta
		name="description"
		content="Selected Broaden Labs engagements across fintech, healthcare operations, B2B commerce, infrastructure and emerging technology."
	/>
</svelte:head>

<section class="section section--tight">
	<div class="container">
		<div class="grid">
			<div class="span-8-4 intro">
				<Eyebrow>Selected work</Eyebrow>
				<DisplayHeading level={1} size="lg">
					Work where design and engineering have to agree.
				</DisplayHeading>
				<p class="lede">
					The most interesting products live at the intersection of difficult workflows, technical
					constraints, and high expectations.
				</p>
				<p class="disclosure">
					Every engagement below is demo fixture content. Broaden is a new studio and these clients
					are fictional — they exist so the work templates could be built and tested honestly.
				</p>
			</div>
		</div>
	</div>
</section>

<section class="section section--flush-top">
	<div class="container">
		<div class="filters">
			<fieldset>
				<legend>Industry</legend>
				<div class="chips">
					<a
						href={filterHref('industry', null)}
						class="chip"
						class:active={!activeIndustry}
						aria-current={!activeIndustry ? 'true' : undefined}
						onclick={(event) => applyFilter(event, filterHref('industry', null))}
					>
						All
					</a>
					{#each INDUSTRIES as industry (industry)}
						{@const href = filterHref('industry', industry)}
						<a
							{href}
							class="chip"
							class:active={activeIndustry === industry}
							aria-current={activeIndustry === industry ? 'true' : undefined}
							onclick={(event) => applyFilter(event, href)}
						>
							{industry}
						</a>
					{/each}
				</div>
			</fieldset>

			<fieldset>
				<legend>Capability</legend>
				<div class="chips">
					<a
						href={filterHref('capability', null)}
						class="chip"
						class:active={!activeCapability}
						aria-current={!activeCapability ? 'true' : undefined}
						onclick={(event) => applyFilter(event, filterHref('capability', null))}
					>
						All
					</a>
					{#each CAPABILITIES as capability (capability)}
						{@const href = filterHref('capability', capability)}
						<a
							{href}
							class="chip"
							class:active={activeCapability === capability}
							aria-current={activeCapability === capability ? 'true' : undefined}
							onclick={(event) => applyFilter(event, href)}
						>
							{capability}
						</a>
					{/each}
				</div>
			</fieldset>
		</div>

		<!--
			Announces the count when the list changes. The region exists at load
			rather than being inserted with its content — an aria-live region added
			to the DOM at the same moment it gains content is not announced by most
			screen readers.
		-->
		<p class="count" aria-live="polite">
			{filtered.length}
			{filtered.length === 1 ? 'project' : 'projects'}{hasFilters ? ' matching' : ''}
		</p>

		{#if filtered.length > 0}
			<ul class="projects" role="list">
				{#each filtered as study, index (study.slug)}
					<li><ProjectCard {study} {index} /></li>
				{/each}
			</ul>
		{:else}
			<div class="empty">
				<h2>Nothing here yet.</h2>
				<p>Try another combination of filters.</p>
				<a class="reset" href="/work" onclick={(event) => applyFilter(event, '/work')}>
					Clear filters
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

	.disclosure {
		max-inline-size: var(--measure-lede);
		padding: var(--space-sm);
		font-size: var(--text-sm);
		line-height: var(--lh-relaxed);
		color: var(--text-muted);
		border-inline-start: var(--border-thick) solid var(--accent);
		background-color: var(--surface-secondary);
	}

	.filters {
		display: grid;
		gap: var(--space-md);
		padding-block-end: var(--space-lg);
		border-block-end: var(--border-hairline) solid var(--border-subtle);
	}

	fieldset {
		display: grid;
		gap: var(--space-2xs);
		padding: 0;
		margin: 0;
		border: none;
	}

	legend {
		padding: 0;
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-eyebrow);
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2xs);
	}

	.chip {
		display: inline-flex;
		align-items: center;
		/* SC 2.5.8 Target Size: filter chips are exactly where axe's target-size
		   rule fires, so the block size is set rather than inherited from text. */
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

	.projects {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
		gap: var(--space-xl);
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
