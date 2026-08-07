<script lang="ts">
	import { PRIMARY_NAV, isCurrentSection } from '#lib/content/navigation';

	/**
	 * Desktop primary navigation. Brief §113.
	 *
	 * The hover affordance is a directional underline that grows from the left,
	 * scaled on a composited transform rather than animating `width`, so it never
	 * touches layout. On leave it collapses to the RIGHT — the asymmetry reads as
	 * the line retreating the way it came rather than rewinding.
	 */
	interface Props {
		pathname: string;
	}

	let { pathname }: Props = $props();
</script>

<nav aria-label="Primary">
	<ul role="list">
		{#each PRIMARY_NAV as link (link.href)}
			{@const current = isCurrentSection(pathname, link.href)}
			<li>
				<a href={link.href} aria-current={current ? 'page' : undefined} class:current>
					{link.label}
					<span class="rule" aria-hidden="true"></span>
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	ul {
		display: flex;
		align-items: center;
		gap: var(--space-lg);
		margin: 0;
	}

	a {
		position: relative;
		/* inline-flex + an explicit min-block-size, not inline-block: SC 2.5.8
		   measures the target box, and an 18px line box with padding still
		   reported 18px to axe on WebKit. */
		display: inline-flex;
		align-items: center;
		min-block-size: 32px;
		padding-block: var(--space-2xs);

		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		text-decoration: none;
		color: var(--text-secondary);

		transition: color var(--dur-instant) var(--ease-exit);
	}

	a:hover,
	a.current {
		color: var(--text-primary);
		transition-duration: var(--dur-fast);
		transition-timing-function: var(--ease-entrance);
	}

	.rule {
		position: absolute;
		inset-block-end: 0;
		inset-inline: 0;
		block-size: 1px;
		background-color: var(--accent);

		transform: scaleX(0);
		transform-origin: 100% 50%; /* leaving: collapses to the right */
		transition: transform var(--dur-instant) var(--ease-exit);
	}

	a:hover .rule,
	a:focus-visible .rule,
	a.current .rule {
		transform: scaleX(1);
		transform-origin: 0 50%; /* entering: grows from the left */
		transition-duration: var(--dur-fast);
		transition-timing-function: var(--ease-entrance);
	}

	/* The current-section rule is always drawn, so it must not animate on hover
	   or the current item flickers when the pointer crosses it. */
	a.current .rule {
		transition: none;
	}
</style>
