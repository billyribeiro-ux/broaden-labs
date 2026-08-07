<script lang="ts">
	import Eyebrow from '#lib/components/typography/Eyebrow.svelte';
	import DisplayHeading from '#lib/components/typography/DisplayHeading.svelte';
	import Button from '#lib/components/buttons/Button.svelte';
	import ServiceCard from '#lib/components/cards/ServiceCard.svelte';
	import Aperture from '#lib/components/motion/Aperture.svelte';
	import { SERVICES } from '#lib/content/services';
</script>

<svelte:head>
	<title>Capabilities — Broaden Labs</title>
	<meta
		name="description"
		content="Broaden Labs works across strategy, product design, software engineering, real-time systems, intelligent automation, and technical architecture."
	/>
</svelte:head>

<section class="section section--tight">
	<div class="container">
		<div class="grid">
			<div class="span-8-4 intro">
				<Eyebrow>Capabilities</Eyebrow>
				<DisplayHeading level={1} size="lg" measure={false}>
					We engineer the product—and the system that makes it possible.
				</DisplayHeading>
				<p class="lede">
					Broaden works across strategy, product design, software engineering, real-time systems,
					intelligent automation, and technical architecture.
				</p>
				<p class="lede">
					Sometimes that means building an entire platform. Sometimes it means solving one hard
					layer exceptionally well.
				</p>
				<Button href="/start-a-project">Discuss your project</Button>
			</div>
		</div>
	</div>
</section>

<section class="section section--flush-top">
	<div class="container">
		<Aperture mode="scale" />
		<ul class="cards" role="list">
			{#each SERVICES as service (service.slug)}
				<li><ServiceCard {service} /></li>
			{/each}
		</ul>
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

	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
		gap: var(--space-md);
		margin-block-start: var(--space-lg);
	}
</style>
