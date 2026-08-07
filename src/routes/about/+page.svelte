<script lang="ts">
	import Eyebrow from '#lib/components/typography/Eyebrow.svelte';
	import DisplayHeading from '#lib/components/typography/DisplayHeading.svelte';

	/**
	 * The manifesto, values and team sections are built in M3.
	 *
	 * The hero copy here is the brief's own, not a placeholder. What is missing is
	 * the rest of the page, which is stated plainly below rather than filled with
	 * shells.
	 */
</script>

<svelte:head>
	<title>About — Broaden Labs</title>
	<meta
		name="description"
		content="Broaden Labs is a software product studio for organizations building something that matters enough to get the details right."
	/>
</svelte:head>

<section class="section">
	<div class="container">
		<div class="grid">
			<div class="span-8-4 content">
				<Eyebrow>About Broaden</Eyebrow>
				<DisplayHeading level={1} size="lg"
					>Built for the space between the idea and the system it requires.</DisplayHeading
				>
				<p class="lede">
					Broaden Labs is a software product studio for organizations building something that
					matters enough to get the details right. We combine product thinking, design, and
					engineering because the most consequential decisions rarely belong to only one discipline.
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
