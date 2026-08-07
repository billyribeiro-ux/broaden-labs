<script lang="ts">
	import Eyebrow from '#lib/components/typography/Eyebrow.svelte';
	import DisplayHeading from '#lib/components/typography/DisplayHeading.svelte';

	/**
	 * The six service detail routes are built in M3.
	 *
	 * The hero copy here is the brief's own, not a placeholder. What is missing is
	 * the rest of the page, which is stated plainly below rather than filled with
	 * shells.
	 */
</script>

<svelte:head>
	<title>Services — Broaden Labs</title>
	<meta
		name="description"
		content="Broaden Labs works across strategy, product design, software engineering, real-time systems, intelligent automation, and technical architecture."
	/>
</svelte:head>

<section class="section">
	<div class="container">
		<div class="grid">
			<div class="span-8-4 content">
				<Eyebrow>Capabilities</Eyebrow>
				<DisplayHeading level={1} size="lg"
					>We engineer the product—and the system that makes it possible.</DisplayHeading
				>
				<p class="lede">
					Broaden works across strategy, product design, software engineering, real-time systems,
					intelligent automation, and technical architecture. Sometimes that means building an
					entire platform. Sometimes it means solving one hard layer exceptionally well.
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
