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
	import { lazyAttach } from '#lib/animation/lazy';
	import type { RevealOptions } from '#lib/animation/motion';

	/**
	 * Every attachment on this page reaches motion.ts — and therefore GSAP —
	 * through lazyAttach rather than a static import. See lazy.ts: `{@attach}`
	 * defers execution but not bundling, so the static import shipped 122 KB of
	 * animation library on the critical path of the largest page in the site.
	 */
	const heroSequence = () =>
		lazyAttach<HTMLElement>(async () => (await import('#lib/animation/motion')).heroSequence());

	const splitReveal = (options: { start?: string } = {}) =>
		lazyAttach<HTMLElement>(async () =>
			(await import('#lib/animation/motion')).splitReveal(options)
		);

	const reveal = (options: RevealOptions = {}) =>
		lazyAttach<HTMLElement>(async () => (await import('#lib/animation/motion')).reveal(options));
	import WebGLStage from '#lib/components/three/WebGLStage.svelte';
	import Seo from '#lib/components/seo/Seo.svelte';

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

<Seo
	title="Broaden Labs — Software, Platforms &amp; Digital Product Engineering"
	description="Broaden Labs designs and engineers custom software, SaaS platforms, real-time systems, intelligent workflows, and high-performance digital products."
/>

<!-- 1 · Arrival ─────────────────────────────────────────────────────────── -->
<section class="section hero">
	<!--
		The stage is a sibling of the content, not a wrapper, and sits at
		z-index: var(--z-below) with pointer-events: none. Brief §83: no meaningful
		information inside a canvas, and nothing in it may intercept a click meant
		for a CTA.
	-->
	<WebGLStage />

	<div class="container">
		<div class="grid">
			<div class="span-full content" {@attach heroSequence()}>
				<div data-hero="eyebrow">
					<Eyebrow>Software • Platforms • Digital Experiences</Eyebrow>
				</div>

				<h1 class="hero-headline" {@attach splitReveal({ start: 'top 95%' })}>
					Software that expands what your business can become.
				</h1>

				<p class="lede" data-hero="copy">
					Broaden Labs designs and engineers ambitious digital products—from high-performance web
					applications and SaaS platforms to real-time systems, intelligent workflows, and the
					infrastructure behind them.
				</p>

				<div class="actions" data-hero="actions">
					<Button href="/start-a-project">Start a project</Button>
					<Button href="/work" variant="secondary">Explore our work</Button>
				</div>

				<p class="microcopy" data-hero="micro">
					Strategy. Design. Engineering. One senior product team.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- 2 · Statement ───────────────────────────────────────────────────────── -->
<section class="section section--tight statement">
	<div class="container">
		<Aperture mode="bracket" />
		<!--
			The two columns are one beat, not two: the statement lands, then the
			supporting body follows a stagger behind it. `:scope > *` rather than a
			class list because the children here are components that own their own
			markup — a page should not be selecting on another component's internals.
		-->
		<div class="grid" {@attach reveal({ children: ':scope > *', stagger: 0.14, start: 'top 80%' })}>
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

		<ul class="cards" role="list" {@attach reveal({ children: 'li', stagger: 0.08 })}>
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

		<ul class="projects" role="list" {@attach reveal({ children: 'li', stagger: 0.11 })}>
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
<section class="section seamed" data-surface="light">
	<div class="container">
		<!--
			The seam. §110 wants the inversion to work as narrative pacing, and until
			now the surface simply changed with nothing marking the moment — the
			single largest beat on the page was the only one with no punctuation.
			`bracket` grows from its centre outward to two terminators, which is the
			motif reading as an aperture opening onto a new surface; `connector`
			closes the passage again where the page returns to dark. Two seams for
			two inversions, and no more, for the same reason there are only two
			inversions.
		-->
		<Aperture mode="bracket" />
		<div class="grid">
			<div
				class="span-8-4 philosophy"
				{@attach reveal({ children: ':scope > *', stagger: 0.1, start: 'top 80%' })}
			>
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
		<ol class="principles" role="list" {@attach reveal({ children: 'li', stagger: 0.06 })}>
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

		<ol class="process" role="list" {@attach reveal({ children: 'li', stagger: 0.08 })}>
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
<section class="section technology seamed">
	<div class="container">
		<!-- The closing seam of the pair opened above the philosophy section. -->
		<Aperture mode="connector" />
		<div class="grid" {@attach reveal({ children: ':scope > *', stagger: 0.14, start: 'top 80%' })}>
			<div class="span-7-5">
				<DisplayHeading size="sm" measure={false}>{TECHNOLOGY.headline}</DisplayHeading>
			</div>
			<div class="span-5-7 body-column">
				<p>{TECHNOLOGY.body}</p>
				<!--
					The stack labels get their own tighter beat: they are a list of
					small equal things, which is exactly what --stagger-tight is for,
					and they should read as one texture arriving rather than as eight
					separate items.
				-->
				<ul class="labels" role="list" {@attach reveal({ children: 'li', stagger: 0.024 })}>
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
			<figure
				class="quote"
				{@attach reveal({ children: 'blockquote, figcaption', stagger: 0.12, start: 'top 82%' })}
			>
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
		<!--
			Rows in a list, not cards in a grid: they arrive one after another down
			the column, so the stagger is looser than the capability cards' and the
			travel shorter — a row that rises far reads as the rule above it moving.
		-->
		<ul
			class="articles"
			role="list"
			{@attach reveal({ children: 'li', stagger: 0.1, distance: 12 })}
		>
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
			<!--
				The close is the page's last beat and gets the page's longest travel
				and loosest stagger: headline, then body, then the CTAs, then the
				microcopy. Revealing the block as one unit (which is what a bare
				`reveal({ distance: 24 })` did) threw all four away at once.
			-->
			<div
				class="span-8-4 closing-content"
				{@attach reveal({ children: ':scope > *', stagger: 0.09, distance: 24, start: 'top 82%' })}
			>
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
		<!--
			The aperture is deliberately NOT part of this reveal. It has its own
			scroll driver writing `--aperture`, and putting it inside a reveal that
			also writes opacity and transform would give one element two owners.
		-->
		<div class="final-copy" {@attach reveal({ children: ':scope > *', stagger: 0.12 })}>
			<DisplayHeading size="md" measure={false}>{FINAL_BRAND_MOMENT.headline}</DisplayHeading>
			<div class="final-body">
				{#each FINAL_BRAND_MOMENT.body as paragraph (paragraph)}
					<p>{paragraph}</p>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	.hero {
		position: relative;
		/* Contains the absolutely-positioned stage. */
		isolation: isolate;
		/*
		 * The stage overhangs this box by 6% at each edge so its parallax has
		 * somewhere to travel from. `clip` — not `hidden` — because clip does NOT
		 * make this a scroll container: no scrollport is created, so nothing
		 * inside can be scrolled to, no scroll anchoring is introduced, and any
		 * descendant scroll-driven timeline still resolves against the document.
		 */
		overflow: clip;
		padding-block-start: var(--space-3xl);
		/* The field needs room to read as a field; below this the composition is
		   cropped to a band and stops meaning anything. */
		min-block-size: 78svh;
	}

	/*
	 * The hero headline is a plain <h1> rather than <DisplayHeading> because
	 * SplitText mutates the element's children, and a component that owns its own
	 * markup should not have another library rewriting it.
	 */
	.hero-headline {
		font-family: var(--font-display);
		font-size: var(--display-hero);
		font-weight: var(--weight-display);
		line-height: var(--lh-display);
		letter-spacing: var(--tracking-mega);
		color: var(--text-primary);
		text-wrap: balance;
	}

	/*
	 * SplitText's mask wrapper needs overflow hidden for the lines to rise from
	 * behind an edge. `:global` because SplitText creates these elements at
	 * runtime, so the scoping hash never reaches them.
	 */
	.hero-headline :global(.split-line) {
		will-change: transform;
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

	/**
	 * A seam needs air on both sides or it is not a seam, it is a collision.
	 *
	 * Measured at 1440px before this rule: the philosophy bracket's terminator
	 * ticks landed 10px above the "HOW WE THINK" eyebrow and the technology
	 * connector sat 12px off the cap-height of "Technology is a means." Both
	 * read as an underline attached to the text rather than as a rule marking
	 * the surface change. --space-xl is the same measure the statement's own
	 * bracket already uses, so the three instances of the motif on this page are
	 * spaced identically.
	 */
	.seamed .grid {
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

	/* Wraps only the copy, so the aperture above keeps its own lifecycle and the
	   reveal has a container whose children are exactly the two things to stage. */
	.final-copy {
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
