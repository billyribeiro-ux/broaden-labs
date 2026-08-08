<script lang="ts">
	import type { CaseStudy } from '#lib/content/schema';
	import ProjectSurface from '#lib/components/work/ProjectSurface.svelte';
	import ArrowUpRightIcon from 'phosphor-svelte/lib/ArrowUpRightIcon';

	/**
	 * Case-study card. Brief §114.
	 *
	 * The whole card is one <a>. Nested interactive elements inside a link are
	 * the usual way these get built and the usual reason they cannot be operated
	 * by keyboard or opened in a new tab.
	 *
	 * Hover moves the metadata and the arrow; on touch there is no hover, so
	 * nothing is hidden behind it — everything the card communicates is present
	 * in its resting state.
	 */
	interface Props {
		study: CaseStudy;
		index?: number;
		/**
		 * The heading level is a PROP because the correct level depends on where the
		 * card sits, and a card cannot know that. On /work and /services the cards
		 * follow the <h1> with no section heading between, so they are that page's
		 * top-level sections and must be <h2>; on the homepage and the detail pages
		 * they sit under a section <h2>, so <h3> is right.
		 *
		 * Hard-coding <h3> shipped a real `heading-order` violation on /work that the
		 * axe E2E could not catch: axe tags that rule `best-practice`, not WCAG, so
		 * the suite's `wcag22aa` filter excluded it. Lighthouse found it. shell.e2e.ts
		 * now checks the rule explicitly.
		 */
		headingLevel?: 2 | 3;
	}

	let { study, index = 0, headingLevel = 3 }: Props = $props();
</script>

<a class="card" href="/work/{study.slug}">
	<div class="media">
		<ProjectSurface surface={study.surface} seed={index} />
	</div>

	<div class="meta">
		<p class="client">
			{study.client}
			<span class="demo" title="Fictional demo content">demo</span>
		</p>
		<svelte:element this={`h${headingLevel}`} class="headline">{study.headline}</svelte:element>
		<p class="category">{study.category} · {study.year}</p>
	</div>

	<span class="arrow" aria-hidden="true"><ArrowUpRightIcon size="1.1em" weight="bold" /></span>
</a>

<style>
	.card {
		position: relative;
		display: grid;
		gap: var(--space-md);
		text-decoration: none;
		color: var(--text-primary);
	}

	.media {
		/**
		 * `clip`, not `hidden`. They clip identically, but `hidden` makes this a
		 * SCROLL CONTAINER — and a scroll container is the nearest scrollport for
		 * everything inside it, which would make the `view()` timeline below
		 * measure the fixture against this 263px frame instead of against the
		 * viewport, and produce no motion at all. `clip` creates no scrollport.
		 */
		overflow: clip;
		border: var(--border-hairline) solid var(--border-subtle);
	}

	/**
	 * The fixture rests slightly oversized so it has somewhere to drift.
	 *
	 * `scale` and `translate` are used as INDEPENDENT properties rather than
	 * both going through `transform`, which is what lets the hover lift and the
	 * scroll drift coexist: an `animation` on `transform` would win over the
	 * hover `transition` on `transform` outright, and the card would stop
	 * responding to the pointer. As separate longhands they compose.
	 */
	.media :global(svg) {
		scale: 1.05;
		transition: scale var(--dur-base) var(--ease-exit);
	}

	.card:hover .media :global(svg),
	.card:focus-visible .media :global(svg) {
		scale: 1.08;
		transition-duration: var(--dur-deliberate);
		transition-timing-function: var(--ease-entrance);
	}

	/**
	 * Parallax on the fixture as the card passes through the viewport.
	 *
	 * ±2.4% against a 5% oversize, so the frame is never uncovered. Driven by a
	 * view-progress timeline, which means no scroll listener, no ScrollTrigger
	 * and no per-frame JavaScript for any number of cards — /work renders six of
	 * these and the main-thread cost of all six is zero.
	 *
	 * Support measured in this project's pinned browsers: Chromium 151 yes,
	 * WebKit 26.5 yes, Firefox 153 no. Firefox gets the resting composition,
	 * which is a finished state rather than a broken one.
	 *
	 * `animation-timeline` and `animation-range` are declared AFTER the
	 * `animation` shorthand on purpose — the shorthand resets both to their
	 * initial values, so the reverse order silently disables the timeline.
	 */
	@supports (animation-timeline: view()) {
		@media (prefers-reduced-motion: no-preference) {
			.media :global(svg) {
				animation: fixture-drift linear both;
				animation-timeline: view();
				animation-range: cover 0% cover 100%;
			}
		}
	}

	@keyframes fixture-drift {
		from {
			translate: 0 -2.4%;
		}
		to {
			translate: 0 2.4%;
		}
	}

	.meta {
		display: grid;
		gap: var(--space-2xs);
	}

	.client {
		display: flex;
		align-items: center;
		gap: var(--space-2xs);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-eyebrow);
		text-transform: uppercase;
		color: var(--text-muted);
	}

	/* Visible on the card itself, not only in a dev overlay: a fictional client
	   name on a public page is exactly the thing that must never read as real. */
	.demo {
		padding-inline: 0.4em;
		padding-block: 0.15em;
		font-size: 0.85em;
		letter-spacing: var(--tracking-wide);
		color: var(--accent);
		border: var(--border-hairline) solid var(--accent);
		border-radius: var(--radius-xs);
	}

	.headline {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: var(--weight-display);
		line-height: var(--lh-heading);
		letter-spacing: var(--tracking-heading);
		text-wrap: balance;
	}

	.category {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	.arrow {
		position: absolute;
		inset-block-start: var(--space-sm);
		inset-inline-end: var(--space-sm);
		display: inline-flex;
		padding: var(--space-2xs);
		color: var(--on-accent);
		background-color: var(--accent);
		opacity: 0;
		transform: translate(calc(var(--dist-xs) * -1), var(--dist-xs));
		transition:
			opacity var(--dur-instant) var(--ease-exit),
			transform var(--dur-instant) var(--ease-exit);
	}

	.card:hover .arrow,
	.card:focus-visible .arrow {
		opacity: 1;
		transform: translate(0, 0);
		transition-duration: var(--dur-fast);
		transition-timing-function: var(--ease-entrance);
	}

	/* On a coarse pointer there is no hover, so the arrow is simply always there
	   rather than being a state nobody can reach. */
	@media (pointer: coarse) {
		.arrow {
			opacity: 1;
			transform: none;
		}
	}
</style>
