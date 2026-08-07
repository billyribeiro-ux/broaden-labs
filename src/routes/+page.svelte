<script lang="ts">
	import Eyebrow from '#lib/components/typography/Eyebrow.svelte';
	import DisplayHeading from '#lib/components/typography/DisplayHeading.svelte';
	import Button from '#lib/components/buttons/Button.svelte';

	/**
	 * Homepage — M2 scope is the arrival beat only.
	 *
	 * The full §111 narrative (statement, capabilities, featured work,
	 * philosophy, principles, process, technology, testimonial, insights, CTA) is
	 * built in M3, once the content architecture exists to drive it. Shipping
	 * empty section shells now would be exactly the "unfinished component shells"
	 * the brief rules out.
	 */
</script>

<svelte:head>
	<title>Broaden Labs — Software, Platforms &amp; Digital Product Engineering</title>
	<meta
		name="description"
		content="Broaden Labs designs and engineers custom software, SaaS platforms, real-time systems, intelligent workflows, and high-performance digital products."
	/>
</svelte:head>

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
</style>
