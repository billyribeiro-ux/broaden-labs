<script lang="ts">
	import Eyebrow from '#lib/components/typography/Eyebrow.svelte';
	import DisplayHeading from '#lib/components/typography/DisplayHeading.svelte';

	/**
	 * The inquiry form is built in M4, when the database and remote functions land.
	 *
	 * The hero copy here is the brief's own, not a placeholder. What is missing is
	 * the rest of the page, which is stated plainly below rather than filled with
	 * shells.
	 */
</script>

<svelte:head>
	<title>Start a project — Broaden Labs</title>
	<meta
		name="description"
		content="Tell us where the product is today, where it needs to go, and what is making that difficult."
	/>
</svelte:head>

<section class="section">
	<div class="container">
		<div class="grid">
			<div class="span-8-4 content">
				<Eyebrow>Start a project</Eyebrow>
				<DisplayHeading level={1} size="lg"
					>Tell us what you're trying to make possible.</DisplayHeading
				>
				<p class="lede">
					You don't need a finished brief. Tell us where the product is today, where it needs to go,
					and what is making that difficult. We'll start there.
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
