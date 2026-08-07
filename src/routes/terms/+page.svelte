<script lang="ts">
	import Eyebrow from '#lib/components/typography/Eyebrow.svelte';
	import DisplayHeading from '#lib/components/typography/DisplayHeading.svelte';
	import Seo from '#lib/components/seo/Seo.svelte';

	/**
	 * Legal copy is written in M7 and must be reviewed by counsel before launch.
	 * Brief §62 is explicit that AI-generated legal language is a DRAFT, so this
	 * route states that it has no content yet rather than shipping invented terms
	 * that look authoritative.
	 */
</script>

<Seo
	title="Terms — Broaden Labs"
	description="Terms policy for Broaden Labs. Not yet written."
	noindex
/>

<section class="section">
	<div class="container">
		<div class="grid">
			<div class="span-8-4 content">
				<Eyebrow>Terms</Eyebrow>
				<DisplayHeading level={1} size="md">Terms</DisplayHeading>
				<p class="lede">
					This policy has not been written yet. It will be drafted and reviewed by counsel before
					launch. Nothing is stated here in the meantime, because a placeholder policy that reads as
					real is worse than an empty one.
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
	}
</style>
