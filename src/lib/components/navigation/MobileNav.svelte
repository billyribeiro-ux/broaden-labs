<script lang="ts">
	import { PRIMARY_NAV, PRIMARY_CTA, isCurrentSection } from '#lib/content/navigation';
	import ListIcon from 'phosphor-svelte/lib/ListIcon';
	import XIcon from 'phosphor-svelte/lib/XIcon';

	/**
	 * Full-screen mobile navigation. Brief §21.
	 *
	 * Built on the native <dialog> element, which supplies the focus trap,
	 * Escape-to-close, top-layer stacking, background inertness and ::backdrop
	 * for free. Every one of those is a thing hand-rolled overlays get subtly
	 * wrong — inert backgrounds and correct focus restoration especially.
	 * <dialog> is Chrome 37 / Firefox 98 / Safari 15.4, well under the target.
	 *
	 * Note the icon imports use the `*Icon` suffix. `phosphor-svelte` ships both
	 * `X.svelte` and `XIcon.svelte`; the bare names shadow DOM globals and are
	 * deprecated.
	 */
	interface Props {
		pathname: string;
	}

	let { pathname }: Props = $props();

	let dialog = $state<HTMLDialogElement | null>(null);
	let open = $state(false);

	/**
	 * Captures the element via an attachment rather than `bind:this`.
	 *
	 * The teardown is the reason: it nulls the reference when the element leaves
	 * the DOM, so a close() that races a navigation cannot call a method on a
	 * detached node. Attachments are also the primitive the rest of this codebase
	 * uses for element lifecycle, so there is one pattern rather than two.
	 */
	function captureDialog(node: HTMLDialogElement) {
		dialog = node;
		return () => {
			dialog = null;
		};
	}

	function show() {
		// showModal() is what puts the dialog in the top layer and makes the rest
		// of the document inert. open() alone does neither.
		dialog?.showModal();
		open = true;
	}

	function close() {
		dialog?.close();
	}

	/**
	 * `close` fires for every dismissal — the button, Escape, and a form submit —
	 * so state is synced here rather than in each handler. Restoring focus to the
	 * trigger is <dialog>'s own behaviour; nothing needs to do it manually.
	 */
	function onclose() {
		open = false;
	}

	/**
	 * Clicking the backdrop closes. The backdrop is not a separate element, so
	 * the test is whether the click landed on the dialog box itself rather than
	 * on its padding area — comparing target to currentTarget is exactly that.
	 */
	function onclick(event: MouseEvent) {
		if (event.target === dialog) close();
	}
</script>

<button type="button" class="trigger" aria-expanded={open} aria-haspopup="dialog" onclick={show}>
	<ListIcon size="1.5rem" weight="regular" aria-hidden="true" />
	<span class="visually-hidden">Open menu</span>
</button>

<dialog {@attach captureDialog} class="menu" aria-label="Site menu" {onclose} {onclick}>
	<div class="panel">
		<div class="panel-head">
			<button type="button" class="close" onclick={close}>
				<XIcon size="1.5rem" weight="regular" aria-hidden="true" />
				<span class="visually-hidden">Close menu</span>
			</button>
		</div>

		<nav aria-label="Primary">
			<ul role="list">
				{#each PRIMARY_NAV as link, index (link.href)}
					{@const current = isCurrentSection(pathname, link.href)}
					<li>
						<a href={link.href} aria-current={current ? 'page' : undefined} onclick={close}>
							<span class="index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
							{link.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<a class="cta" href={PRIMARY_CTA.href} onclick={close}>{PRIMARY_CTA.label}</a>
	</div>
</dialog>

<style>
	.trigger,
	.close {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		/* SC 2.5.8 Target Size — 24×24 CSS px is the minimum and icon-only header
		   controls are exactly where axe's `target-size` rule fires. */
		inline-size: 44px;
		block-size: 44px;
		color: var(--text-primary);
	}

	.menu {
		/* A <dialog> is display:none until open; these are the open styles. */
		inline-size: 100%;
		max-inline-size: none;
		block-size: 100%;
		max-block-size: none;
		margin: 0;
		padding: 0;
		border: none;
		background-color: var(--surface-primary);
		color: var(--text-primary);
	}

	.menu::backdrop {
		background-color: color-mix(in srgb, var(--obsidian) 88%, transparent);
	}

	.panel {
		display: flex;
		flex-direction: column;
		/* svh, not vh: on mobile Safari vh is the LARGEST viewport, so a vh-sized
		   panel is taller than the visible area whenever the address bar is
		   showing and the CTA sits below the fold. */
		block-size: 100svh;
		padding-inline: var(--gutter);
		padding-block: var(--space-md) var(--space-2xl);
	}

	.panel-head {
		display: flex;
		justify-content: flex-end;
		/* Pulls the 44px target back to the optical edge without shrinking it. */
		margin-inline-end: calc(var(--space-2xs) * -1);
	}

	nav {
		flex: 1;
		display: flex;
		align-items: center;
	}

	ul {
		inline-size: 100%;
		margin: 0;
	}

	li {
		border-block-start: var(--border-hairline) solid var(--border-subtle);
	}

	li:last-child {
		border-block-end: var(--border-hairline) solid var(--border-subtle);
	}

	li a {
		display: flex;
		align-items: baseline;
		gap: var(--space-md);
		padding-block: var(--space-md);

		font-family: var(--font-display);
		font-size: var(--text-3xl);
		font-weight: var(--weight-display);
		letter-spacing: var(--tracking-display);
		text-decoration: none;
		color: var(--text-primary);
	}

	li a[aria-current='page'] {
		color: var(--accent);
	}

	.index {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-eyebrow);
		color: var(--text-muted);
	}

	.cta {
		display: flex;
		align-items: center;
		justify-content: center;
		min-block-size: 56px;

		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		letter-spacing: var(--tracking-wide);
		text-decoration: none;

		color: var(--on-accent);
		background-color: var(--accent);
		border-radius: var(--radius-xs);
	}

	/* The trigger only exists below the desktop breakpoint; SiteHeader hides the
	   desktop nav above it. Both are driven by the same width so they can never
	   both be visible or both be hidden. */
	@media (width >= 64rem) {
		.trigger {
			display: none;
		}
	}
</style>
