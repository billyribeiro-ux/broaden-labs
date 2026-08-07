<script lang="ts">
	import Eyebrow from '#lib/components/typography/Eyebrow.svelte';
	import DisplayHeading from '#lib/components/typography/DisplayHeading.svelte';

	/**
	 * Articles are built in M3.
	 *
	 * The hero copy here is the brief's own, not a placeholder. What is missing is
	 * the rest of the page, which is stated plainly below rather than filled with
	 * shells.
	 */
</script>

<svelte:head>
	<title>Insights — Broaden Labs</title>
	<meta
		name="description"
		content="Notes from Broaden on software architecture, product design, real-time systems, AI, engineering, performance, and building digital products that can keep changing."
	/>
</svelte:head>

<section class="section">
	<div class="container">
		<div class="grid">
			<div class="span-8-4 content">
				<Eyebrow>Insights</Eyebrow>
				<DisplayHeading level={1} size="lg"
					>Thinking about products, systems, and the decisions between them.</DisplayHeading
				>
				<p class="lede">
					Notes from Broaden on software architecture, product design, real-time systems, AI,
					engineering, performance, and building digital products that can keep changing.
				</p>
			</div>
		</div>
	</div>
</section>

<style>
	.content {
		display: grid;
		gap: var(--space-md);
		justify-items: start;
	}

	.lede {
		max-inline-size: var(--measure-lede);
		font-size: var(--text-lg);
		line-height: var(--lh-relaxed);
		color: var(--text-secondary);
		white-space: pre-line;
	}
</style>
