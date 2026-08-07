<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * Accessible field wrapper. Brief §59, §79.
	 *
	 * Kit's `field.as(type)` returns ONLY `{ name, type, 'aria-invalid', value }`.
	 * It supplies no `id` and no `aria-describedby`, so the association between a
	 * control, its label, its hint and its error message is ours to build — this
	 * component is that wiring, in one place, so it cannot be got right on four
	 * fields and wrong on the fifth.
	 *
	 * The error is rendered in a container that EXISTS whether or not there is an
	 * error, with aria-live on it. A live region inserted at the same moment it
	 * gains content is not announced by most screen readers.
	 */
	interface Props {
		label: string;
		/** Stable id root; the control and its descriptions derive from it. */
		id: string;
		issues?: readonly { readonly message: string }[] | undefined;
		hint?: string | undefined;
		required?: boolean;
		/** Receives the ids the control must reference. */
		children: Snippet<[{ id: string; describedBy: string | undefined }]>;
	}

	let { label, id, issues, hint, required = false, children }: Props = $props();

	const hintId = $derived(hint ? `${id}-hint` : undefined);
	const errorId = $derived(`${id}-error`);
	const hasIssues = $derived((issues?.length ?? 0) > 0);

	// aria-describedby takes a space-separated list, and must not reference an
	// empty error node — pointing at an element with no text makes some screen
	// readers announce nothing where a hint would otherwise have been read.
	const describedBy = $derived(
		[hintId, hasIssues ? errorId : undefined].filter(Boolean).join(' ') || undefined
	);
</script>

<div class="field" class:invalid={hasIssues}>
	<label for={id}>
		{label}
		{#if required}
			<span class="required" aria-hidden="true">*</span>
			<span class="visually-hidden">(required)</span>
		{:else}
			<span class="optional">optional</span>
		{/if}
	</label>

	{#if hint}
		<p class="hint" id={hintId}>{hint}</p>
	{/if}

	{@render children({ id, describedBy })}

	<p class="error" id={errorId} aria-live="polite">
		{#if hasIssues}
			{issues?.[0]?.message}
		{/if}
	</p>
</div>

<style>
	.field {
		display: grid;
		gap: var(--space-3xs);
	}

	label {
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		color: var(--text-primary);
	}

	.required {
		color: var(--accent);
	}

	.optional {
		margin-inline-start: var(--space-3xs);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		color: var(--text-muted);
	}

	.hint {
		font-size: var(--text-sm);
		color: var(--text-muted);
	}

	/*
	 * Reserves one line whether or not an error is present, so validating a field
	 * does not push the rest of the form down. A form that reflows as you tab
	 * through it is how people click the wrong control.
	 */
	.error {
		min-block-size: 1lh;
		font-size: var(--text-sm);
		color: var(--danger);
	}

	.field :global(input),
	.field :global(textarea),
	.field :global(select) {
		inline-size: 100%;
		min-block-size: 44px;
		padding-block: var(--space-2xs);
		padding-inline: var(--space-sm);

		font-size: var(--text-base);
		color: var(--text-primary);

		background-color: var(--surface-inset);
		border: var(--border-hairline) solid var(--border-strong);
		border-radius: var(--radius-xs);

		transition: border-color var(--dur-instant) var(--ease-exit);
	}

	.field :global(textarea) {
		min-block-size: 9lh;
		resize: vertical;
		line-height: var(--lh-body);
	}

	.field :global(input:hover),
	.field :global(textarea:hover),
	.field :global(select:hover) {
		border-color: var(--text-secondary);
	}

	/*
	 * Driven by aria-invalid, which Kit sets on the control itself — so the
	 * visual error state and the programmatic one cannot disagree. A class-based
	 * error style can be applied without the ARIA, which looks correct and
	 * announces nothing.
	 */
	.field :global([aria-invalid='true']) {
		border-color: var(--danger);
	}
</style>
