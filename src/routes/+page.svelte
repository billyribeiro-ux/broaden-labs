<script lang="ts">
	import Eyebrow from '#lib/components/typography/Eyebrow.svelte';
	import DisplayHeading from '#lib/components/typography/DisplayHeading.svelte';
	import Button from '#lib/components/buttons/Button.svelte';
	import Aperture from '#lib/components/motion/Aperture.svelte';
	import ServiceCard from '#lib/components/cards/ServiceCard.svelte';
	import ProjectCard from '#lib/components/cards/ProjectCard.svelte';
	import ArticleCard from '#lib/components/cards/ArticleCard.svelte';
	import { SERVICES } from '#lib/content/services';
	import { CASE_STUDIES } from '#lib/content/demo/case-studies';
	import { TESTIMONIALS } from '#lib/content/demo/people';
	import { INSIGHTS } from '#lib/content/insights';
	import {
		STATEMENT,
		CAPABILITY_INTRO,
		WORK_INTRO,
		PHILOSOPHY,
		PRINCIPLES,
		PROCESS_INTRO,
		PROCESS,
		TECHNOLOGY,
		CLOSING,
		FINAL_BRAND_MOMENT
	} from '#lib/content/narrative';
	import { PUBLIC_CONTACT_EMAIL } from '$app/env/public';

	/**
	 * Homepage. Brief §111 narrative order.
	 *
	 * The dark/light rhythm is TWO inversions and no more: dark through the work,
	 * light for philosophy/principles/process, dark again from technology to the
	 * close. §110 wants the inversion to work as narrative pacing, and pacing
	 * only exists if the beat is rare.
	 */
	const featured = CASE_STUDIES.slice(0, 3);
	const latestInsights = INSIGHTS.slice(0, 3);
	const testimonial = TESTIMONIALS[0];
</script>

<svelte:head>
	<title>Broaden Labs — Software, Platforms &amp; Digital Product Engineering</title>
	<meta
		name="description"
		content="Broaden Labs designs and engineers custom software, SaaS platforms, real-time systems, intelligent workflows, and high-performance digital products."
	/>
</svelte:head>

<!-- 1 · Arrival ─────────────────────────────────────────────────────────── -->
<section class="section hero">
	<div class="container">
		<div class="grid">
			<div class="span-full content">
				<Eyebrow>Software • Platforms • Digital Experiences</Eyebrow>

				<DisplayHeading level={1} size="hero" measure={false}>
					Software that expands what your business can become.
				</DisplayHeading>

				<p class="lede">
					Broaden Labs designs and engineers ambitious digital products—from high-performance web
					applications and SaaS platforms to real-time systems, intelligent workflows, and the
					infrastructure behind them.
				</p>

				<div class="actions">
					<Button href="/start-a-project">Start a project</Button>
					<Button href="/work" variant="secondary">Explore our work</Button>
				</div>

				<p class="microcopy">Strategy. Design. Engineering. One senior product team.</p>
			</div>
		</div>
	</div>
</section>

<!-- 2 · Statement ───────────────────────────────────────────────────────── -->
<section class="section section--tight statement">
	<div class="container">
		<Aperture mode="bracket" />
		<div class="grid">
			<div class="span-7-5">
				<DisplayHeading size="lg" measure={false}>
					{STATEMENT.headline}
					<span class="follow">{STATEMENT.follow}</span>
				</DisplayHeading>
			</div>
			<div class="span-5-7 body-column">
				{#each STATEMENT.body as paragraph (paragraph)}
					<p>{paragraph}</p>
				{/each}
			</div>
		</div>
	</div>
</section>

<!-- 3 · Capabilities ────────────────────────────────────────────────────── -->
<section class="section" id="capabilities">
	<div class="container">
		<div class="grid intro">
			<div class="span-8-4">
				<Eyebrow>{CAPABILITY_INTRO.eyebrow}</Eyebrow>
				<DisplayHeading size="md">{CAPABILITY_INTRO.headline}</DisplayHeading>
			</div>
			<div class="span-4-8">
				<p class="intro-body">{CAPABILITY_INTRO.body}</p>
			</div>
		</div>

		<ul class="cards" role="list">
			{#each SERVICES as service (service.slug)}
				<li><ServiceCard {service} /></li>
			{/each}
		</ul>
	</div>
</section>

<!-- 4 · Featured work ───────────────────────────────────────────────────── -->
<section class="section" id="work">
	<div class="container">
		<div class="grid intro">
			<div class="span-8-4">
				<Eyebrow>{WORK_INTRO.eyebrow}</Eyebrow>
				<DisplayHeading size="md">{WORK_INTRO.headline}</DisplayHeading>
			</div>
			<div class="span-4-8">
				{#each WORK_INTRO.body as paragraph (paragraph)}
					<p class="intro-body">{paragraph}</p>
				{/each}
			</div>
		</div>

		<ul class="projects" role="list">
			{#each featured as study, index (study.slug)}
				<li><ProjectCard {study} {index} /></li>
			{/each}
		</ul>

		<div class="more-work">
			<Button href="/work" variant="secondary" arrow>See all work</Button>
		</div>
	</div>
</section>

<!-- 5 · Philosophy — first surface inversion ────────────────────────────── -->
<section class="section" data-surface="light">
	<div class="container">
		<div class="grid">
			<div class="span-8-4 philosophy">
				<Eyebrow>{PHILOSOPHY.eyebrow}</Eyebrow>
				<DisplayHeading size="md" measure={false}>{PHILOSOPHY.headline}</DisplayHeading>
				<div class="philosophy-body">
					{#each PHILOSOPHY.body as paragraph (paragraph)}
						<p>{paragraph}</p>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>

<!-- 6 · Principles ──────────────────────────────────────────────────────── -->
<section class="section section--flush-top" data-surface="light">
	<div class="container">
		<ol class="principles" role="list">
			{#each PRINCIPLES as principle (principle.number)}
				<li class="principle">
					<span class="principle-number" aria-hidden="true">{principle.number}</span>
					<div class="principle-body">
						<h3 class="principle-title">{principle.title}</h3>
						{#each principle.body as paragraph (paragraph)}
							<p>{paragraph}</p>
						{/each}
					</div>
				</li>
			{/each}
		</ol>
	</div>
</section>

<!-- 7 · Process ─────────────────────────────────────────────────────────── -->
<section class="section" data-surface="light">
	<div class="container">
		<div class="grid intro">
			<div class="span-8-4">
				<Eyebrow>{PROCESS_INTRO.eyebrow}</Eyebrow>
				<DisplayHeading size="md">{PROCESS_INTRO.headline}</DisplayHeading>
			</div>
			<div class="span-4-8">
				<p class="intro-body">{PROCESS_INTRO.body}</p>
			</div>
		</div>

		<ol class="process" role="list">
			{#each PROCESS as step (step.number)}
				<li class="step">
					<div class="step-head">
						<span class="step-number" aria-hidden="true">{step.number}</span>
						<h3 class="step-name">{step.name}</h3>
					</div>
					<h4 class="step-headline">{step.headline}</h4>
					<p class="step-copy">{step.copy}</p>
					<ul class="outputs" role="list">
						{#each step.outputs as output (output)}
							<li>{output}</li>
						{/each}
					</ul>
				</li>
			{/each}
		</ol>
	</div>
</section>

<!-- 8 · Technology — second inversion, back to dark ─────────────────────── -->
<section class="section technology">
	<div class="container">
		<div class="grid">
			<div class="span-7-5">
				<DisplayHeading size="sm" measure={false}>{TECHNOLOGY.headline}</DisplayHeading>
			</div>
			<div class="span-5-7 body-column">
				<p>{TECHNOLOGY.body}</p>
				<ul class="labels" role="list">
					{#each TECHNOLOGY.labels as label (label)}
						<li>{label}</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
</section>

<!-- 9 · Testimonial ─────────────────────────────────────────────────────── -->
{#if testimonial}
	<section class="section section--tight">
		<div class="container">
			<figure class="quote">
				<Aperture mode="gate" />
				<blockquote>
					<p>{testimonial.quote}</p>
				</blockquote>
				<figcaption>
					<span class="attribution">{testimonial.author}</span>
					<span class="attribution-role">{testimonial.role}, {testimonial.company}</span>
					<span class="demo-flag">Demo content — this engagement is fictional</span>
				</figcaption>
			</figure>
		</div>
	</section>
{/if}

<!-- 10 · Insights ───────────────────────────────────────────────────────── -->
<section class="section">
	<div class="container">
		<div class="grid intro">
			<div class="span-8-4">
				<Eyebrow>Insights</Eyebrow>
				<DisplayHeading size="md">Notes from the work.</DisplayHeading>
			</div>
		</div>
		<ul class="articles" role="list">
			{#each latestInsights as insight (insight.slug)}
				<li><ArticleCard {insight} /></li>
			{/each}
		</ul>
		<div class="more-work">
			<Button href="/insights" variant="secondary" arrow>Read all insights</Button>
		</div>
	</div>
</section>

<!-- 11 · Closing CTA ────────────────────────────────────────────────────── -->
<section class="section closing">
	<div class="container">
		<div class="grid">
			<div class="span-8-4 closing-content">
				<DisplayHeading size="lg" measure={false}>{CLOSING.headline}</DisplayHeading>
				<p class="closing-body">{CLOSING.body}</p>
				<div class="actions">
					<Button href="/start-a-project">Start a project</Button>
					<Button href="mailto:{PUBLIC_CONTACT_EMAIL}" variant="secondary" arrow={false}>
						{PUBLIC_CONTACT_EMAIL}
					</Button>
				</div>
				<p class="microcopy">{CLOSING.small}</p>
			</div>
		</div>
	</div>
</section>

<!-- 12 · Final brand moment ─────────────────────────────────────────────── -->
<section class="section section--tight final">
	<div class="container">
		<Aperture mode="scale" />
		<DisplayHeading size="md" measure={false}>{FINAL_BRAND_MOMENT.headline}</DisplayHeading>
		<div class="final-body">
			{#each FINAL_BRAND_MOMENT.body as paragraph (paragraph)}
				<p>{paragraph}</p>
			{/each}
		</div>
	</div>
</section>

<style>
	.hero {
		padding-block-start: var(--space-3xl);
	}

	.content {
		display: grid;
		gap: var(--space-lg);
		justify-items: start;
	}

	.lede {
		max-inline-size: 52ch;
		font-size: var(--text-lg);
		line-height: var(--lh-relaxed);
		color: var(--text-secondary);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}

	.microcopy {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		color: var(--text-muted);
	}

	.statement .follow {
		display: block;
		margin-block-start: 0.2em;
		color: var(--text-muted);
	}

	.statement .grid {
		margin-block-start: var(--space-xl);
	}

	.body-column {
		display: grid;
		gap: var(--space-md);
		align-content: start;
		font-size: var(--text-base);
		line-height: var(--lh-relaxed);
		color: var(--text-secondary);
	}

	.intro {
		margin-block-end: var(--space-2xl);
		row-gap: var(--space-md);
	}

	.intro-body {
		max-inline-size: var(--measure-lede);
		font-size: var(--text-base);
		line-height: var(--lh-relaxed);
		color: var(--text-secondary);
	}

	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
		gap: var(--space-md);
		margin: 0;
	}

	.projects {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
		gap: var(--space-xl);
		margin: 0;
	}

	.more-work {
		margin-block-start: var(--space-xl);
	}

	.philosophy {
		display: grid;
		gap: var(--space-md);
	}

	.philosophy-body {
		display: grid;
		gap: var(--space-md);
		max-inline-size: 62ch;
		font-size: var(--text-lg);
		line-height: var(--lh-relaxed);
		color: var(--text-secondary);
	}

	.principles {
		display: grid;
		gap: 0;
		margin: 0;
	}

	.principle {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-md);
		padding-block: var(--space-lg);
		border-block-start: var(--border-hairline) solid var(--border-subtle);
	}

	.principle:last-child {
		border-block-end: var(--border-hairline) solid var(--border-subtle);
	}

	.principle-number {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-eyebrow);
		color: var(--accent);
	}

	.principle-body {
		display: grid;
		gap: var(--space-2xs);
		max-inline-size: 62ch;
	}

	.principle-title {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: var(--weight-display);
		letter-spacing: var(--tracking-heading);
	}

	.principle-body p {
		color: var(--text-secondary);
	}

	.process {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
		gap: var(--space-lg);
		margin: 0;
	}

	.step {
		display: grid;
		align-content: start;
		gap: var(--space-2xs);
		padding-block-start: var(--space-md);
		border-block-start: var(--border-thick) solid var(--accent);
	}

	.step-head {
		display: flex;
		align-items: baseline;
		gap: var(--space-2xs);
	}

	.step-number,
	.step-name {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-eyebrow);
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.step-headline {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: var(--weight-display);
		letter-spacing: var(--tracking-heading);
		color: var(--text-primary);
	}

	.step-copy {
		font-size: var(--text-sm);
		line-height: var(--lh-relaxed);
		color: var(--text-secondary);
	}

	.outputs {
		display: grid;
		gap: 0.15em;
		margin-block-start: var(--space-2xs);
		padding: 0;
	}

	.outputs li {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-muted);
	}

	.labels {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2xs);
		margin: 0;
		padding: 0;
	}

	.labels li {
		padding-inline: 0.7em;
		padding-block: 0.3em;
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		color: var(--text-secondary);
		border: var(--border-hairline) solid var(--border-subtle);
	}

	.quote {
		display: grid;
		gap: var(--space-md);
		max-inline-size: 46rem;
		margin: 0;
	}

	.quote blockquote p {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: var(--weight-semibold);
		line-height: var(--lh-tight);
		letter-spacing: var(--tracking-heading);
		text-wrap: balance;
	}

	.quote figcaption {
		display: grid;
		gap: var(--space-3xs);
	}

	.attribution {
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
	}

	.attribution-role {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	/* Not a dev-only overlay. A fictional endorsement on a public page has to be
	   labelled on the page. */
	.demo-flag {
		margin-block-start: var(--space-2xs);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		color: var(--accent);
	}

	.articles {
		display: grid;
		margin: 0;
	}

	.closing-content {
		display: grid;
		gap: var(--space-md);
		justify-items: start;
	}

	.closing-body {
		max-inline-size: var(--measure-lede);
		font-size: var(--text-lg);
		line-height: var(--lh-relaxed);
		color: var(--text-secondary);
	}

	.final {
		display: grid;
		gap: var(--space-md);
	}

	.final .container {
		display: grid;
		gap: var(--space-md);
	}

	.final-body {
		display: grid;
		gap: var(--space-2xs);
		max-inline-size: var(--measure-lede);
		font-size: var(--text-lg);
		color: var(--text-secondary);
	}
</style>
