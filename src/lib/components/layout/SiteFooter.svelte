<script lang="ts">
	import Wordmark from '#lib/components/brand/Wordmark.svelte';
	import {
		PRIMARY_NAV,
		CAPABILITY_NAV,
		LEGAL_NAV,
		CONNECT_LINKS,
		PRIMARY_CTA
	} from '#lib/content/navigation';
	import { PUBLIC_CONTACT_EMAIL } from '$app/env/public';

	/**
	 * Site footer. Brief §61.
	 *
	 * The year is computed at render time — the brief is explicit that it must
	 * not be hardcoded. This runs on the server during prerendering, which means
	 * a page prerendered in December and served in January would show the old
	 * year; the <time> element carries the machine-readable value either way, and
	 * the site is redeployed far more often than annually.
	 */
	const year = new Date().getFullYear();
</script>

<footer class="footer" data-surface="dark">
	<div class="container">
		<div class="statement">
			<p class="line">Build beyond.</p>
		</div>

		<div class="columns">
			<nav aria-labelledby="footer-explore">
				<h2 id="footer-explore" class="column-title">Explore</h2>
				<ul role="list">
					{#each PRIMARY_NAV as link (link.href)}
						<li><a href={link.href}>{link.label}</a></li>
					{/each}
				</ul>
			</nav>

			<nav aria-labelledby="footer-capabilities">
				<h2 id="footer-capabilities" class="column-title">Capabilities</h2>
				<ul role="list">
					{#each CAPABILITY_NAV as link (link.href)}
						<li><a href={link.href}>{link.label}</a></li>
					{/each}
				</ul>
			</nav>

			<nav aria-labelledby="footer-connect">
				<h2 id="footer-connect" class="column-title">Connect</h2>
				<ul role="list">
					<li><a href={PRIMARY_CTA.href}>{PRIMARY_CTA.label}</a></li>
					<li><a href="mailto:{PUBLIC_CONTACT_EMAIL}">{PUBLIC_CONTACT_EMAIL}</a></li>
					{#each CONNECT_LINKS as link (link.label)}
						<li>
							{#if link.href}
								<a href={link.href} rel="me noopener" target="_blank">{link.label}</a>
							{:else}
								<!-- No profile exists yet. Rendering an unlinked label is honest;
								     a href="#" would be a control that looks interactive and is not. -->
								<span class="pending">{link.label} <span class="pending-note">soon</span></span>
							{/if}
						</li>
					{/each}
				</ul>
			</nav>

			<nav aria-labelledby="footer-legal">
				<h2 id="footer-legal" class="column-title">Legal</h2>
				<ul role="list">
					{#each LEGAL_NAV as link (link.href)}
						<li><a href={link.href}>{link.label}</a></li>
					{/each}
				</ul>
			</nav>
		</div>

		<div class="baseline">
			<Wordmark size="sm" descriptor />
			<p class="copyright">
				© <time datetime={String(year)}>{year}</time> Broaden Labs. All rights reserved.
			</p>
		</div>
	</div>
</footer>

<style>
	.footer {
		padding-block: var(--space-3xl) var(--space-xl);
		background-color: var(--surface-primary);
		color: var(--text-primary);
		border-block-start: var(--border-hairline) solid var(--border-subtle);
	}

	.statement {
		padding-block-end: var(--space-2xl);
	}

	.line {
		font-family: var(--font-display);
		font-size: var(--display-sm);
		font-weight: var(--weight-display);
		line-height: var(--lh-tight);
		letter-spacing: var(--tracking-display);
	}

	.columns {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
		gap: var(--space-xl);
		padding-block: var(--space-2xl);
		border-block-start: var(--border-hairline) solid var(--border-subtle);
	}

	.column-title {
		margin-block-end: var(--space-md);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-eyebrow);
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.columns ul {
		display: grid;
		gap: var(--space-2xs);
		margin: 0;
	}

	.columns a {
		font-size: var(--text-sm);
		text-decoration: none;
		color: var(--text-secondary);
		transition: color var(--dur-instant) var(--ease-exit);
	}

	.columns a:hover {
		color: var(--text-primary);
		text-decoration: underline;
		transition-duration: var(--dur-fast);
		transition-timing-function: var(--ease-entrance);
	}

	.pending {
		display: inline-flex;
		align-items: baseline;
		gap: var(--space-2xs);
		font-size: var(--text-sm);
		color: var(--text-muted);
	}

	.pending-note {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
	}

	.baseline {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-md);
		padding-block-start: var(--space-xl);
		border-block-start: var(--border-hairline) solid var(--border-subtle);
	}

	.copyright {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		color: var(--text-muted);
	}
</style>
