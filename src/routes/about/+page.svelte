<script lang="ts">
	import Eyebrow from '#lib/components/typography/Eyebrow.svelte';
	import DisplayHeading from '#lib/components/typography/DisplayHeading.svelte';
	import Button from '#lib/components/buttons/Button.svelte';
	import Aperture from '#lib/components/motion/Aperture.svelte';
	import Portrait from '#lib/components/brand/Portrait.svelte';
	import { ABOUT_MANIFESTO, WHY_BROADEN, VALUES } from '#lib/content/narrative';
	import { TEAM } from '#lib/content/demo/people';
	import Seo from '#lib/components/seo/Seo.svelte';
</script>

<Seo
	title="About — Broaden Labs"
	description="Broaden Labs is a software product studio for organizations building something that matters enough to get the details right."
	image="/og/about.png"
	breadcrumbs={[{ name: 'About', href: '/about' }]}
/>

<section class="section section--tight">
	<div class="container">
		<div class="grid">
			<div class="span-8-4 intro">
				<Eyebrow>About Broaden</Eyebrow>
				<DisplayHeading level={1} size="lg" measure={false}>
					Built for the space between the idea and the system it requires.
				</DisplayHeading>
				<p class="lede">
					Broaden Labs is a software product studio for organizations building something that
					matters enough to get the details right.
				</p>
				<p class="lede">
					We combine product thinking, design, and engineering because the most consequential
					decisions rarely belong to only one discipline.
				</p>
			</div>
		</div>
	</div>
</section>

<section class="section" data-surface="light">
	<div class="container">
		<div class="grid">
			<div class="span-7-5">
				<DisplayHeading size="md" measure={false}>{ABOUT_MANIFESTO.headline}</DisplayHeading>
			</div>
			<div class="span-5-7 prose">
				{#each ABOUT_MANIFESTO.body as paragraph (paragraph)}
					<p>{paragraph}</p>
				{/each}
			</div>
		</div>
	</div>
</section>

<section class="section" data-surface="light">
	<div class="container">
		<div class="grid">
			<div class="span-5-7">
				<DisplayHeading size="sm">{WHY_BROADEN.headline}</DisplayHeading>
			</div>
			<div class="span-7-5 prose">
				{#each WHY_BROADEN.body as paragraph (paragraph)}
					<p>{paragraph}</p>
				{/each}
			</div>
		</div>
	</div>
</section>

<section class="section">
	<div class="container">
		<Eyebrow>What we hold to</Eyebrow>
		<ul class="values" role="list">
			{#each VALUES as value (value.title)}
				<li>
					<h2>{value.title}</h2>
					{#each value.body as paragraph (paragraph)}
						<p>{paragraph}</p>
					{/each}
				</li>
			{/each}
		</ul>
	</div>
</section>

<section class="section">
	<div class="container">
		<div class="team-head">
			<Eyebrow>The team</Eyebrow>
			<p class="demo-note">Demo profiles — these people are fictional</p>
		</div>

		<p class="team-disclosure">
			Broaden is a new studio and its team is not yet public. The profiles below are fixture records
			that exist so the component could be built and tested. Portraits are generated compositions,
			not photographs of anyone.
		</p>

		<ul class="team" role="list">
			{#each TEAM as member, index (member.id)}
				<li class="member">
					<Portrait seed={index} name={member.name} />
					<h3 class="member-name">{member.name}</h3>
					<p class="member-role">{member.role}</p>
					<p class="member-bio">{member.bio}</p>
					<ul class="expertise" role="list">
						{#each member.expertise as area (area)}
							<li>{area}</li>
						{/each}
					</ul>
				</li>
			{/each}
		</ul>
	</div>
</section>

<section class="section section--tight cta">
	<div class="container">
		<Aperture mode="gate" />
		<DisplayHeading size="md" measure={false}>
			Bring us something that has to be right.
		</DisplayHeading>
		<div class="cta-actions">
			<Button href="/start-a-project">Start a project</Button>
			<Button href="/work" variant="secondary" arrow={false}>See the work</Button>
		</div>
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

	.prose {
		display: grid;
		gap: var(--space-md);
		max-inline-size: 62ch;
		font-size: var(--text-base);
		line-height: var(--lh-relaxed);
		color: var(--text-secondary);
	}

	.values {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
		gap: var(--space-lg);
		margin-block-start: var(--space-lg);
		padding: 0;
	}

	.values li {
		display: grid;
		align-content: start;
		gap: var(--space-2xs);
		padding-block-start: var(--space-md);
		border-block-start: var(--border-thick) solid var(--accent);
	}

	.values h2 {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: var(--weight-display);
		letter-spacing: var(--tracking-heading);
	}

	.values p {
		font-size: var(--text-sm);
		line-height: var(--lh-relaxed);
		color: var(--text-secondary);
	}

	.team-head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-sm);
	}

	.demo-note {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		color: var(--accent);
	}

	.team-disclosure {
		max-inline-size: var(--measure-lede);
		margin-block-start: var(--space-md);
		padding: var(--space-sm);
		font-size: var(--text-sm);
		line-height: var(--lh-relaxed);
		color: var(--text-muted);
		border-inline-start: var(--border-thick) solid var(--accent);
		background-color: var(--surface-secondary);
	}

	.team {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
		gap: var(--space-xl);
		margin-block-start: var(--space-xl);
		padding: 0;
	}

	.member {
		display: grid;
		align-content: start;
		gap: var(--space-2xs);
	}

	.member-name {
		margin-block-start: var(--space-sm);
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: var(--weight-display);
		letter-spacing: var(--tracking-heading);
	}

	.member-role {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.member-bio {
		font-size: var(--text-sm);
		line-height: var(--lh-relaxed);
		color: var(--text-secondary);
	}

	.expertise {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3xs);
		margin-block-start: var(--space-2xs);
		padding: 0;
	}

	.expertise li {
		padding-inline: 0.6em;
		padding-block: 0.2em;
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-muted);
		border: var(--border-hairline) solid var(--border-subtle);
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
