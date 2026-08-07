<script lang="ts">
	import type { Snippet } from 'svelte';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';

	/**
	 * The button system. Brief §80.
	 *
	 * Renders an <a> when given an `href` and a <button> otherwise — never a
	 * <div> with a click handler, and never a <button> that navigates. That
	 * distinction is what keeps the keyboard, middle-click, "open in new tab" and
	 * the context menu working.
	 *
	 * The prop contract is EXPLICIT rather than extending HTMLAnchorAttributes |
	 * HTMLButtonAttributes. Spreading a union of those two into one element is
	 * not type-safe — their legacy `on:*` handlers are typed to different element
	 * types, so the union never narrows and the spread only compiles behind a
	 * cast. A design-system button also does not want the whole HTML attribute
	 * surface; the list below is what it actually supports. Brief §79.
	 *
	 * Optional props are typed `T | undefined` rather than `prop?: T` because
	 * `exactOptionalPropertyTypes` is on: without the explicit `| undefined`,
	 * forwarding a possibly-undefined value into the element is an error.
	 */
	type Variant = 'primary' | 'secondary' | 'text';

	interface Props {
		children: Snippet;
		variant?: Variant;
		/** Shows a pending affordance and blocks interaction. Buttons only. */
		loading?: boolean;
		/** Appends the directional arrow. On by default for primary CTAs. */
		arrow?: boolean | undefined;

		/** Present ⇒ renders an anchor. */
		href?: string | undefined;
		target?: '_blank' | undefined;

		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean | undefined;
		onclick?: ((event: MouseEvent) => void) | undefined;

		id?: string | undefined;
		'aria-label'?: string | undefined;
		'aria-describedby'?: string | undefined;
		'aria-controls'?: string | undefined;
		'aria-expanded'?: boolean | undefined;
	}

	let {
		children,
		variant = 'primary',
		loading = false,
		arrow,
		href,
		target,
		type = 'button',
		disabled,
		onclick,
		id,
		'aria-label': ariaLabel,
		'aria-describedby': ariaDescribedby,
		'aria-controls': ariaControls,
		'aria-expanded': ariaExpanded
	}: Props = $props();

	// Primary CTAs carry the arrow unless told otherwise; other variants opt in.
	// Derived rather than computed once so it tracks a changing `variant`.
	const showArrow = $derived(arrow ?? variant === 'primary');

	// An external link needs both, and `noopener` is the half that actually
	// matters — without it the opened page gets a handle on window.opener.
	const rel = $derived(target === '_blank' ? 'noopener noreferrer' : undefined);
</script>

{#snippet inner()}
	<span class="label">{@render children()}</span>
	{#if showArrow}
		<span class="arrow" aria-hidden="true"><ArrowRightIcon size="1em" weight="bold" /></span>
	{/if}
{/snippet}

{#if href !== undefined}
	<a
		{href}
		{target}
		{rel}
		{id}
		{onclick}
		class="button"
		data-variant={variant}
		aria-label={ariaLabel}
		aria-describedby={ariaDescribedby}
		aria-controls={ariaControls}
		aria-expanded={ariaExpanded}
	>
		{@render inner()}
	</a>
{:else}
	<button
		{type}
		{id}
		{onclick}
		class="button"
		data-variant={variant}
		data-loading={loading}
		disabled={disabled || loading || undefined}
		aria-label={ariaLabel}
		aria-describedby={ariaDescribedby}
		aria-controls={ariaControls}
		aria-expanded={ariaExpanded}
	>
		{@render inner()}
	</button>
{/if}

<style>
	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2xs);

		padding-block: 0.85em;
		padding-inline: 1.5em;

		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		letter-spacing: var(--tracking-wide);
		line-height: var(--lh-flat);
		text-decoration: none;
		white-space: nowrap;

		border: var(--border-hairline) solid transparent;
		border-radius: var(--radius-xs);
		cursor: pointer;

		/* Reversible interactions enter slower and leave faster — the asymmetry is
		   what stops the motion reading as mechanical. This declares the LEAVING
		   state; :hover overrides with the entrance pair. */
		transition:
			background-color var(--dur-instant) var(--ease-exit),
			border-color var(--dur-instant) var(--ease-exit),
			color var(--dur-instant) var(--ease-exit);

		/* SC 2.5.8 Target Size (Minimum). `target-size` is the only rule the
		   wcag22aa axe tag adds, and buttons in a header are where it fires. */
		min-block-size: 44px;
	}

	.button:hover {
		transition-duration: var(--dur-fast);
		transition-timing-function: var(--ease-entrance);
	}

	.arrow {
		display: inline-flex;
		transition: transform var(--dur-instant) var(--ease-exit);
	}

	.button:hover .arrow {
		transform: translateX(var(--dist-xs));
		transition-duration: var(--dur-fast);
		transition-timing-function: var(--ease-entrance);
	}

	/* ── primary ─────────────────────────────────────────────────────────── */
	.button[data-variant='primary'] {
		background-color: var(--accent);
		color: var(--on-accent); /* 6.50:1 dark, 5.50:1 light, against the fill */
	}

	.button[data-variant='primary']:hover {
		background-color: var(--accent-hover);
	}

	/* ── secondary ───────────────────────────────────────────────────────── */
	.button[data-variant='secondary'] {
		background-color: transparent;
		color: var(--text-primary);
		border-color: var(--border-strong); /* ≥3:1 on every surface */
	}

	.button[data-variant='secondary']:hover {
		border-color: var(--text-primary);
		background-color: color-mix(in srgb, var(--text-primary) 6%, transparent);
	}

	/* ── text ────────────────────────────────────────────────────────────── */
	.button[data-variant='text'] {
		padding-inline: 0;
		min-block-size: 0;
		background: none;
		color: var(--accent);
	}

	.button[data-variant='text']:hover {
		color: var(--accent-hover);
		text-decoration: underline;
		text-underline-offset: 0.3em;
	}

	/* ── pressed ─────────────────────────────────────────────────────────── */
	.button:active {
		transform: translateY(1px);
	}

	/* ── disabled / loading ──────────────────────────────────────────────── */
	.button:disabled {
		cursor: not-allowed;
		opacity: 0.55;
	}

	.button:disabled .arrow,
	.button:disabled:active {
		transform: none;
	}

	/* The pending affordance is a border pulse rather than a spinner — brief §98,
	   "avoid spinners for every interaction". It stops entirely under reduced
	   motion, where the disabled state alone communicates the same thing. */
	.button[data-loading='true'] {
		border-color: var(--accent);
		animation: pulse-border 1.4s var(--ease-emphasis) infinite;
	}

	@keyframes pulse-border {
		50% {
			border-color: transparent;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.button[data-loading='true'] {
			animation: none;
		}
	}
</style>
