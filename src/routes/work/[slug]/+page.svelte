<script lang="ts">
	import Eyebrow from '#lib/components/typography/Eyebrow.svelte';
	import DisplayHeading from '#lib/components/typography/DisplayHeading.svelte';
	import Button from '#lib/components/buttons/Button.svelte';
	import Aperture from '#lib/components/motion/Aperture.svelte';
	import ProjectSurface from '#lib/components/work/ProjectSurface.svelte';
	import ArchitectureDiagram from '#lib/components/work/ArchitectureDiagram.svelte';
	import type { PageProps } from './$types';
	import Seo from '#lib/components/seo/Seo.svelte';

	/**
	 * Case study template. Brief §48, §49.
	 *
	 * §48 asks for compositional variety across studies rather than one
	 * rectangular template repeated six times. The variation here is structural
	 * and content-driven, not decorative: the metric band, the interface fixture
	 * and the architecture diagram each appear where the study's own material
	 * justifies them, and the Meridian study is the one that carries the
	 * interactive system diagram (§102).
	 */
	let { data }: PageProps = $props();

	const study = $derived(data.study);
	const next = $derived(data.next);
	const showDiagram = $derived(study.slug === 'meridian-markets');
</script>

<Seo
	title="{study.client} — {study.project} | Broaden Labs"
	description={study.summary[0] ?? study.headline}
	breadcrumbs={[
		{ name: 'Work', href: '/work' },
		{ name: study.client, href: `/work/${study.slug}` }
	]}
/>

<article>
	<!-- Hero ────────────────────────────────────────────────────────────── -->
	<section class="section section--tight">
		<div class="container">
			<div class="grid">
				<div class="span-8-4 hero">
					<Eyebrow>{study.category}</Eyebrow>
					<DisplayHeading level={1} size="lg" measure={false}>{study.headline}</DisplayHeading>
					<p class="client-line">
						{study.client}
						<span class="demo">Demo — fictional client</span>
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Interface fixture ───────────────────────────────────────────────── -->
	<section class="section section--flush-top">
		<div class="container">
			<div class="fixture">
				<ProjectSurface surface={study.surface} />
			</div>
			<p class="fixture-note">
				An original composition authored for this site, not a screenshot. Brief §108: every fixture
				asset is generated here so it is unambiguously licensable.
			</p>
		</div>
	</section>

	<!-- Project metadata ────────────────────────────────────────────────── -->
	<section class="section section--tight">
		<div class="container">
			<Aperture mode="bracket" />
			<dl class="metadata">
				<div>
					<dt>Client</dt>
					<dd>{study.client}</dd>
				</div>
				<div>
					<dt>Industry</dt>
					<dd>{study.industry}</dd>
				</div>
				<div>
					<dt>Project</dt>
					<dd>{study.project}</dd>
				</div>
				<div>
					<dt>Year</dt>
					<dd>{study.year}</dd>
				</div>
				<div class="services">
					<dt>Services</dt>
					<dd>
						<ul role="list">
							{#each study.services as service (service)}
								<li>{service}</li>
							{/each}
						</ul>
					</dd>
				</div>
			</dl>
		</div>
	</section>

	<!-- Challenge — light inversion, the study's one narrative beat ─────── -->
	<section class="section" data-surface="light">
		<div class="container">
			<div class="grid">
				<div class="span-5-7">
					<Eyebrow>The challenge</Eyebrow>
				</div>
				<div class="span-7-5 prose">
					{#each study.challenge as paragraph, index (paragraph)}
						{#if index === 0}
							<p class="prose-lead">{paragraph}</p>
						{:else}
							<p>{paragraph}</p>
						{/if}
					{/each}
				</div>
			</div>
		</div>
	</section>

	<!-- Approach ────────────────────────────────────────────────────────── -->
	<section class="section" data-surface="light">
		<div class="container">
			<div class="grid">
				<div class="span-5-7">
					<Eyebrow>The approach</Eyebrow>
				</div>
				<div class="span-7-5 prose">
					{#each study.approach as paragraph (paragraph)}
						<p>{paragraph}</p>
					{/each}
				</div>
			</div>
		</div>
	</section>

	{#if showDiagram}
		<!-- Technical architecture — brief §102 ─────────────────────────── -->
		<section class="section">
			<div class="container">
				<div class="grid intro">
					<div class="span-8-4">
						<Eyebrow>System architecture</Eyebrow>
						<DisplayHeading size="sm">Where data becomes action.</DisplayHeading>
					</div>
				</div>
				<ArchitectureDiagram />
			</div>
		</section>
	{/if}

	<!-- Outcomes ────────────────────────────────────────────────────────── -->
	<section class="section">
		<div class="container">
			<div class="grid intro">
				<div class="span-8-4">
					<Eyebrow>Outcomes</Eyebrow>
					<DisplayHeading size="sm">What changed.</DisplayHeading>
				</div>
			</div>

			<ul class="metrics" role="list">
				{#each study.metrics as metric (metric.label)}
					<li>
						<span class="metric-value">{metric.value}</span>
						<span class="metric-label">{metric.label}</span>
					</li>
				{/each}
			</ul>

			<p class="metrics-note">
				These figures are invented fixture data. They exist to exercise the metric component and
				measure nothing — no engagement produced them.
			</p>

			<div class="prose outcome-prose">
				{#each study.outcome as paragraph (paragraph)}
					<p>{paragraph}</p>
				{/each}
			</div>
		</div>
	</section>

	<!-- Next project ────────────────────────────────────────────────────── -->
	<section class="section next">
		<div class="container">
			<Aperture mode="connector" />
			<a class="next-link" href="/work/{next.slug}">
				<span class="next-label">Next project</span>
				<span class="next-headline">{next.headline}</span>
			</a>
			<div class="next-actions">
				<Button href="/work" variant="secondary" arrow={false}>Return to work</Button>
				<Button href="/start-a-project">Start a project</Button>
			</div>
		</div>
	</section>
</article>

<style>
	.hero {
		display: grid;
		gap: var(--space-md);
		justify-items: start;
	}

	.client-line {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2xs);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--text-secondary);
	}

	.demo {
		padding-inline: 0.5em;
		padding-block: 0.2em;
		font-size: 0.85em;
		color: var(--accent);
		border: var(--border-hairline) solid var(--accent);
	}

	.fixture {
		border: var(--border-hairline) solid var(--border-subtle);
	}

	.fixture-note,
	.metrics-note {
		max-inline-size: var(--measure-lede);
		margin-block-start: var(--space-sm);
		font-size: var(--text-xs);
		font-family: var(--font-mono);
		line-height: var(--lh-relaxed);
		color: var(--text-muted);
	}

	.metadata {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 10rem), 1fr));
		gap: var(--space-lg);
		margin-block-start: var(--space-lg);
	}

	.metadata dt {
		margin-block-end: var(--space-3xs);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-eyebrow);
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.metadata dd {
		margin: 0;
		font-size: var(--text-base);
		color: var(--text-primary);
	}

	.services ul {
		display: grid;
		gap: var(--space-3xs);
		margin: 0;
		padding: 0;
	}

	.services li {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	.prose {
		display: grid;
		gap: var(--space-md);
		max-inline-size: 62ch;
		font-size: var(--text-base);
		line-height: var(--lh-relaxed);
		color: var(--text-secondary);
	}

	.prose-lead {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: var(--weight-semibold);
		line-height: var(--lh-tight);
		letter-spacing: var(--tracking-heading);
		color: var(--text-primary);
		text-wrap: balance;
	}

	.intro {
		margin-block-end: var(--space-xl);
	}

	.metrics {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
		gap: var(--space-lg);
		margin: 0;
		padding: 0;
	}

	.metrics li {
		display: grid;
		gap: var(--space-2xs);
		padding-block-start: var(--space-md);
		border-block-start: var(--border-thick) solid var(--accent);
	}

	.metric-value {
		font-family: var(--font-display);
		font-size: var(--display-sm);
		font-weight: var(--weight-display);
		line-height: var(--lh-flat);
		letter-spacing: var(--tracking-display);
		/* Tabular figures so a column of metrics aligns rather than shimmering. */
		font-variant-numeric: tabular-nums;
	}

	.metric-label {
		font-size: var(--text-sm);
		line-height: var(--lh-relaxed);
		color: var(--text-secondary);
	}

	.outcome-prose {
		margin-block-start: var(--space-xl);
	}

	.next-link {
		display: grid;
		gap: var(--space-2xs);
		margin-block-start: var(--space-lg);
		text-decoration: none;
		color: var(--text-primary);
	}

	.next-label {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-eyebrow);
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.next-headline {
		max-inline-size: 20ch;
		font-family: var(--font-display);
		font-size: var(--display-sm);
		font-weight: var(--weight-display);
		line-height: var(--lh-tight);
		letter-spacing: var(--tracking-display);
		text-wrap: balance;
	}

	.next-link:hover .next-headline {
		color: var(--accent);
	}

	.next-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		margin-block-start: var(--space-xl);
	}
</style>
