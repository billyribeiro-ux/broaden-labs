<script lang="ts">
	import type { Insight } from '#lib/content/schema';

	interface Props {
		insight: Insight;
		/**
		 * See ProjectCard for the full reasoning. On /insights the cards follow the
		 * <h1> with no section heading between them, so they are that page's
		 * top-level sections and must be <h2>. Everywhere else they sit under a
		 * section <h2> and <h3> is correct.
		 */
		headingLevel?: 2 | 3;
	}

	let { insight, headingLevel = 3 }: Props = $props();

	// Intl rather than a hand-built format. A regex over a formatted date string
	// is how a date becomes "20-3341".
	const published = $derived(
		new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(new Date(insight.published))
	);
</script>

<a class="card" href="/insights/{insight.slug}">
	<p class="meta">
		<span class="category">{insight.category}</span>
		<span class="dot" aria-hidden="true">·</span>
		<time datetime={insight.published}>{published}</time>
		<span class="dot" aria-hidden="true">·</span>
		<span>{insight.readingMinutes} min read</span>
	</p>
	<svelte:element this={`h${headingLevel}`} class="title">{insight.title}</svelte:element>
	<p class="dek">{insight.dek}</p>
</a>

<style>
	.card {
		position: relative;
		display: grid;
		gap: var(--space-2xs);
		padding-block: var(--space-lg);
		text-decoration: none;
		color: var(--text-primary);
		border-block-start: var(--border-hairline) solid var(--border-subtle);
	}

	/**
	 * The row's own aperture: the hairline that already separates these rows,
	 * redrawn in the accent from the left on hover and retracting to the right
	 * on leave.
	 *
	 * This is the motif the rest of the site already speaks — DesktopNav's
	 * underline and Aperture's `rule` mode use the identical grow-from-left /
	 * collapse-to-the-right pair — rather than a new gesture invented for this
	 * one component. It is a composited scaleX over a 1px line, so it costs no
	 * layout and no paint.
	 *
	 * Negative offset because an absolutely positioned child is placed against
	 * the PADDING box, and this has to sit on the border itself, not below it.
	 */
	.card::after {
		content: '';
		position: absolute;
		inset-block-start: calc(var(--border-hairline) * -1);
		inset-inline: 0;
		block-size: var(--border-hairline);
		background-color: var(--accent);

		transform: scaleX(0);
		transform-origin: 100% 50%; /* leaving: retracts the way it came */
		transition: transform var(--dur-instant) var(--ease-exit);
	}

	.card:hover::after,
	.card:focus-visible::after {
		transform: scaleX(1);
		transform-origin: 0 50%; /* entering: draws from the left */
		transition-duration: var(--dur-base);
		transition-timing-function: var(--ease-entrance);
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2xs);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		color: var(--text-muted);
	}

	.category {
		color: var(--accent);
	}

	.title {
		/**
		 * MEASURE CONTROL. Without this the headline is as wide as the row, and
		 * the row is as wide as the container: measured at 1440px, "Real-time UX
		 * is a state-management problem before it's a networking problem" set one
		 * unbroken 1086px line — about 90 characters of display type, where the
		 * dek beneath it was already capped at 62. At 2560px it runs wider still.
		 *
		 * 34ch keeps every headline in this set to two or three lines and gives
		 * `text-wrap: balance` something to balance, which is the whole reason the
		 * base stylesheet sets it on headings.
		 */
		max-inline-size: 34ch;

		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: var(--weight-display);
		line-height: var(--lh-heading);
		letter-spacing: var(--tracking-heading);
		text-wrap: balance;

		/**
		 * The underline is always PRESENT and only its colour changes, so it
		 * fades rather than appearing between one frame and the next. Declaring
		 * it on hover, as this did, cannot be transitioned at all —
		 * `text-decoration-line` is not an animatable property, and it was the
		 * one interactive element on the site with no enter/exit pair.
		 */
		text-decoration: underline;
		text-decoration-color: transparent;
		text-underline-offset: 0.18em;

		transition:
			color var(--dur-instant) var(--ease-exit),
			text-decoration-color var(--dur-instant) var(--ease-exit);
	}

	.card:hover .title,
	.card:focus-visible .title {
		color: var(--accent);
		text-decoration-color: currentcolor;
		transition-duration: var(--dur-fast);
		transition-timing-function: var(--ease-entrance);
	}

	.dek {
		max-inline-size: 62ch;
		font-size: var(--text-base);
		color: var(--text-secondary);
	}
</style>
