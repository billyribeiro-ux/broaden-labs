<script lang="ts">
	import Wordmark from '#lib/components/brand/Wordmark.svelte';
	import DesktopNav from '#lib/components/navigation/DesktopNav.svelte';
	import MobileNav from '#lib/components/navigation/MobileNav.svelte';
	import { PRIMARY_CTA } from '#lib/content/navigation';

	/**
	 * Site header. Brief §21.
	 *
	 * Sticky and visually integrated rather than a floating glass pill. The
	 * scrolled state is a hairline that appears once the header stops sitting on
	 * the hero — no backdrop-filter, which is Safari 18+ and would be an
	 * enhancement masquerading as a layout mechanism.
	 *
	 * The scrolled state is driven by CSS `animation-timeline: scroll()` where
	 * supported and simply stays in its resting state where it is not. That keeps
	 * a scroll listener off the main thread entirely — there is no JS here at
	 * all, which is also why the header works with JavaScript disabled.
	 */
	interface Props {
		pathname: string;
	}

	let { pathname }: Props = $props();
</script>

<header class="header">
	<div class="inner container">
		<a class="home" href="/" aria-label="Broaden Labs — home">
			<Wordmark size="md" />
		</a>

		<div class="desktop">
			<DesktopNav {pathname} />
			<a class="cta" href={PRIMARY_CTA.href}>{PRIMARY_CTA.label}</a>
		</div>

		<div class="mobile">
			<MobileNav {pathname} />
		</div>
	</div>
</header>

<style>
	.header {
		position: sticky;
		inset-block-start: 0;
		z-index: var(--z-header);
		background-color: var(--surface-primary);
	}

	.inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-lg);
		min-block-size: 72px;
		border-block-end: var(--border-hairline) solid transparent;
	}

	/**
	 * Scroll-driven animation: the hairline fades in over the first 120px.
	 * `animation-timeline: scroll()` is Chrome 115+ / Safari 26 and unsupported
	 * in Firefox, so it is wrapped in @supports and the fallback is a permanent
	 * hairline — a resting state that is correct, not a broken one.
	 */
	@supports not (animation-timeline: scroll()) {
		.inner {
			border-block-end-color: var(--border-subtle);
		}
	}

	@supports (animation-timeline: scroll()) {
		.inner {
			animation: reveal-rule linear both;
			animation-timeline: scroll();
			animation-range: 0 120px;
		}
	}

	@keyframes reveal-rule {
		to {
			border-block-end-color: var(--border-subtle);
		}
	}

	/* A scroll-driven animation is still animation. Under reduced motion the
	   hairline is simply always present. */
	@media (prefers-reduced-motion: reduce) {
		.inner {
			animation: none;
			border-block-end-color: var(--border-subtle);
		}
	}

	.home {
		display: inline-flex;
		text-decoration: none;
	}

	.desktop {
		display: none;
		align-items: center;
		gap: var(--space-xl);
	}

	.mobile {
		display: flex;
		/* Pulls the 44px hit area back to the optical gutter edge without
		   shrinking the target below SC 2.5.8's minimum. */
		margin-inline-end: calc(var(--space-xs) * -1);
	}

	.cta {
		display: inline-flex;
		align-items: center;
		min-block-size: 40px;
		padding-inline: var(--space-md);

		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		letter-spacing: var(--tracking-wide);
		text-decoration: none;

		color: var(--text-primary);
		border: var(--border-hairline) solid var(--border-strong);
		border-radius: var(--radius-xs);

		transition:
			border-color var(--dur-instant) var(--ease-exit),
			transform var(--dur-instant) var(--ease-exit);
	}

	.cta:hover {
		border-color: var(--accent);
		/* A subtle spatial shift, per §113 — no bounce, no glow. */
		transform: translateY(calc(var(--dist-xs) * -0.5));
		transition-duration: var(--dur-fast);
		transition-timing-function: var(--ease-entrance);
	}

	@media (width >= 64rem) {
		.desktop {
			display: flex;
		}

		.mobile {
			display: none;
		}
	}
</style>
