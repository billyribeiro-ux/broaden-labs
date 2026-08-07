<script lang="ts">
	import Eyebrow from '#lib/components/typography/Eyebrow.svelte';
	import DisplayHeading from '#lib/components/typography/DisplayHeading.svelte';
	import Button from '#lib/components/buttons/Button.svelte';
	import Aperture from '#lib/components/motion/Aperture.svelte';
	import ServiceMotif from '#lib/components/services/ServiceMotif.svelte';
	import ProjectCard from '#lib/components/cards/ProjectCard.svelte';
	import ArticleCard from '#lib/components/cards/ArticleCard.svelte';
	import type { PageProps } from './$types';
	import Seo from '#lib/components/seo/Seo.svelte';

	/**
	 * Service detail. Brief §40–46.
	 *
	 * §40: "Do not make six identical pages with the nouns changed. Each should
	 * have its own art direction and interaction motif while remaining within the
	 * system." The variable here is `service.motif`, which selects a distinct
	 * generated composition per service, and the section ORDER shifts with it —
	 * the fit-criteria list leads on modernization, where the question is always
	 * "does this apply to us", and trails elsewhere.
	 */
	let { data }: PageProps = $props();

	const service = $derived(data.service);
	const leadWithFit = $derived(service.slug === 'platform-modernization');
</script>

<Seo
	title={service.metaTitle}
	description={service.metaDescription}
	breadcrumbs={[
		{ name: 'Services', href: '/services' },
		{ name: service.name, href: `/services/${service.slug}` }
	]}
/>

<article>
	<section class="section section--tight">
		<div class="container">
			<div class="grid hero-grid">
				<div class="span-7-5 hero">
					<Eyebrow>{service.number} — {service.name}</Eyebrow>
					<DisplayHeading level={1} size="lg" measure={false}>{service.heroHeadline}</DisplayHeading
					>
					<div class="intro">
						{#each service.heroIntro as paragraph (paragraph)}
							<p>{paragraph}</p>
						{/each}
					</div>
				</div>
				<div class="span-5-7 motif">
					<ServiceMotif motif={service.motif} />
				</div>
			</div>
		</div>
	</section>

	{#if leadWithFit}
		{@render fitSection()}
	{/if}

	<section class="section" data-surface="light">
		<div class="container">
			<div class="grid">
				<div class="span-5-7">
					<DisplayHeading size="md">{service.sectionHeadline}</DisplayHeading>
				</div>
				<div class="span-7-5 prose">
					{#each service.sectionCopy as paragraph (paragraph)}
						<p>{paragraph}</p>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<section class="section" data-surface="light">
		<div class="container">
			<Eyebrow>Capabilities</Eyebrow>
			<ul class="capabilities" role="list">
				{#each service.capabilities as capability (capability)}
					<li>{capability}</li>
				{/each}
			</ul>
		</div>
	</section>

	{#if !leadWithFit}
		{@render fitSection()}
	{/if}

	{#if data.related.length > 0}
		<section class="section">
			<div class="container">
				<div class="intro-row">
					<Eyebrow>Relevant work</Eyebrow>
					<p class="demo-note">Fictional demo engagements</p>
				</div>
				<ul class="related" role="list">
					{#each data.related as study, index (study.slug)}
						<li><ProjectCard {study} {index} /></li>
					{/each}
				</ul>
			</div>
		</section>
	{/if}

	<section class="section section--tight">
		<div class="container">
			<Eyebrow>Related reading</Eyebrow>
			<ul class="readings" role="list">
				{#each data.readings as insight (insight.slug)}
					<li><ArticleCard {insight} /></li>
				{/each}
			</ul>
		</div>
	</section>

	<section class="section cta">
		<div class="container">
			<Aperture mode="gate" />
			<DisplayHeading size="md" measure={false}>{service.ctaLabel}.</DisplayHeading>
			<div class="cta-actions">
				<Button href="/start-a-project">Start a project</Button>
				<Button href="/services" variant="secondary" arrow={false}>All capabilities</Button>
			</div>
			<nav class="others" aria-label="Other capabilities">
				<ul role="list">
					{#each data.others as other (other.slug)}
						<li><a href="/services/{other.slug}">{other.name}</a></li>
					{/each}
				</ul>
			</nav>
		</div>
	</section>
</article>

{#snippet fitSection()}
	<section class="section">
		<div class="container">
			<div class="grid">
				<div class="span-5-7">
					<Eyebrow>Ideal when</Eyebrow>
				</div>
				<div class="span-7-5">
					<ul class="fits" role="list">
						{#each service.fitsWhen as condition (condition)}
							<li>{condition}</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	</section>
{/snippet}

<style>
	.hero-grid {
		align-items: center;
		row-gap: var(--space-xl);
	}

	.hero {
		display: grid;
		gap: var(--space-md);
	}

	.intro {
		display: grid;
		gap: var(--space-sm);
		max-inline-size: var(--measure-lede);
		font-size: var(--text-lg);
		line-height: var(--lh-relaxed);
		color: var(--text-secondary);
	}

	.motif {
		display: grid;
	}

	.prose {
		display: grid;
		gap: var(--space-md);
		max-inline-size: 62ch;
		font-size: var(--text-base);
		line-height: var(--lh-relaxed);
		color: var(--text-secondary);
	}

	.capabilities {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
		gap: 0;
		margin-block-start: var(--space-lg);
		padding: 0;
	}

	.capabilities li {
		padding-block: var(--space-sm);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		letter-spacing: var(--tracking-wide);
		color: var(--text-primary);
		border-block-start: var(--border-hairline) solid var(--border-subtle);
	}

	.fits {
		display: grid;
		gap: 0;
		margin: 0;
		padding: 0;
		max-inline-size: 62ch;
	}

	.fits li {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-sm);
		padding-block: var(--space-sm);
		font-size: var(--text-lg);
		color: var(--text-secondary);
		border-block-start: var(--border-hairline) solid var(--border-subtle);
	}

	.fits li::before {
		content: '';
		inline-size: 20px;
		block-size: 1px;
		margin-block-start: 0.75em;
		background-color: var(--accent);
	}

	.fits li:last-child {
		border-block-end: var(--border-hairline) solid var(--border-subtle);
	}

	.intro-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-sm);
		margin-block-end: var(--space-lg);
	}

	.demo-note {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		color: var(--accent);
	}

	.related {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
		gap: var(--space-xl);
		margin: 0;
	}

	.readings {
		display: grid;
		margin-block-start: var(--space-md);
	}

	.cta .container {
		display: grid;
		gap: var(--space-md);
	}

	.cta-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}

	.others {
		margin-block-start: var(--space-xl);
		padding-block-start: var(--space-lg);
		border-block-start: var(--border-hairline) solid var(--border-subtle);
	}

	.others ul {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-md);
		margin: 0;
	}

	.others a {
		display: inline-flex;
		align-items: center;
		min-block-size: 28px;
		font-size: var(--text-sm);
		text-decoration: none;
		color: var(--text-secondary);
	}

	.others a:hover {
		color: var(--accent);
		text-decoration: underline;
	}
</style>
