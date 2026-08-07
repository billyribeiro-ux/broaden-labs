<script lang="ts">
	import { page } from '$app/state';
	import Eyebrow from '#lib/components/typography/Eyebrow.svelte';
	import DisplayHeading from '#lib/components/typography/DisplayHeading.svelte';
	import Button from '#lib/components/buttons/Button.svelte';

	/**
	 * Global error page. Brief §63, §64.
	 *
	 * In Kit 3 the error arrives as a component PROP as well as on `page.error`.
	 * `page.error` is used here because this component also renders for errors
	 * raised before a route node resolves.
	 *
	 * Nothing from the underlying exception reaches this template — Kit reduces
	 * unexpected errors to `{ status, message }` before they cross the wire, and
	 * `handleError` is what decides what `message` says. There is no stack trace
	 * to leak here even by accident.
	 */
	const status = $derived(page.status);
	const notFound = $derived(status === 404);

	const heading = $derived(notFound ? 'This path stopped here.' : 'Something broke on our side.');
	const body = $derived(
		notFound
			? 'The page may have moved, changed, or never existed.'
			: 'The request did not complete. Nothing you did caused it, and trying again often works.'
	);
</script>

<svelte:head>
	<title>{status} — Broaden Labs</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="section error">
	<div class="container">
		<div class="grid">
			<div class="span-7-5 content">
				<Eyebrow>{status}</Eyebrow>
				<DisplayHeading level={1} size="lg">{heading}</DisplayHeading>
				<p class="body">{body}</p>

				{#if page.error?.errorId}
					<!-- Correlates what the visitor sees with the server log line, so a
					     support conversation can start from a fact rather than a guess. -->
					<p class="reference">
						Reference <code>{page.error.errorId}</code>
					</p>
				{/if}

				<div class="actions">
					<Button href="/">Return home</Button>
					<Button href="/work" variant="secondary">Explore our work</Button>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.error {
		display: flex;
		align-items: center;
		min-block-size: 70svh;
	}

	.content {
		display: grid;
		gap: var(--space-md);
		justify-items: start;
	}

	.body {
		max-inline-size: var(--measure-lede);
		font-size: var(--text-lg);
		color: var(--text-secondary);
	}

	.reference {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		color: var(--text-muted);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		margin-block-start: var(--space-sm);
	}
</style>
