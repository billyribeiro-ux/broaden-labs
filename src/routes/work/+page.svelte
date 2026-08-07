<script lang="ts">
	import Eyebrow from '#lib/components/typography/Eyebrow.svelte';
	import DisplayHeading from '#lib/components/typography/DisplayHeading.svelte';

	/**
	 * Case studies are built in M3.
	 *
	 * The hero copy here is the brief's own, not a placeholder. What is missing is
	 * the rest of the page, which is stated plainly below rather than filled with
	 * shells.
	 */
</script>

<svelte:head>
	<title>Work — Broaden Labs</title>
	<meta
		name="description"
		content="Selected Broaden Labs engagements across fintech, healthcare operations, B2B commerce, infrastructure and emerging technology."
	/>
</svelte:head>

<section class="section">
	<div class="container">
		<div class="grid">
			<div class="span-8-4 content">
				<Eyebrow>Selected Work</Eyebrow>
				<DisplayHeading level={1} size="lg"
					>Work where design and engineering have to agree.</DisplayHeading
				>
				<p class="lede">
					The most interesting products live at the intersection of difficult workflows, technical
					constraints, and high expectations. Explore selected Broaden engagements below.
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
