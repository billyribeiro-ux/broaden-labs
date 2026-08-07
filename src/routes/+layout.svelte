<script lang="ts">
	import '#lib/styles/app.css';
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import favicon from '#lib/assets/favicon.svg';
	// Imported rather than hardcoded so the preload points at the SAME
	// content-hashed URL the stylesheet requests. A hand-written path would miss
	// the hash, preload a file nothing uses, and double the transfer.
	import displayFont from '#lib/assets/fonts/bricolage-var-latin.woff2';
	import bodyFont from '#lib/assets/fonts/instrument-var-latin.woff2';
	import SkipLink from '#lib/components/navigation/SkipLink.svelte';
	import SiteHeader from '#lib/components/layout/SiteHeader.svelte';
	import SiteFooter from '#lib/components/layout/SiteFooter.svelte';

	/**
	 * Root layout.
	 *
	 * `page` comes from `$app/state`, not `$app/stores` — the latter still
	 * resolves in Kit 3 but throws at runtime on any access.
	 */
	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} type="image/svg+xml" />
	<meta name="theme-color" content="#090A0C" />

	<!--
		Exactly two files are preloaded: the display and body latin subsets.
		Not latin-ext (loaded on demand via unicode-range) and not mono (metadata,
		always below the fold).

		This is what holds CLS at zero. size-adjust makes the fallback's average
		character width match, but it cannot make LINE BREAKS match — Bricolage is
		4.85% narrower than Arial Bold, so a swapped-in headline rewraps and every
		element below it moves. Measured: without these two links the homepage
		shifts 35px at 1440px for a CLS of 0.0022. Preloading means the face is
		already there at first paint and no swap ever happens.

		crossorigin is REQUIRED even same-origin: fonts are fetched in CORS mode,
		and a preload without it is a second, uncredited request that the CSS then
		ignores — the file is downloaded twice and the preload does nothing.
	-->
	<link rel="preload" href={displayFont} as="font" type="font/woff2" crossorigin="anonymous" />
	<link rel="preload" href={bodyFont} as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

<SkipLink />
<SiteHeader pathname={page.url.pathname} />

<!--
	tabindex="-1" makes the skip-link target programmatically focusable without
	adding it to the tab order. Without it, following the skip link moves the
	scroll position but leaves focus at the top of the document, so the next Tab
	returns the user to the navigation they just skipped.
-->
<main id="main" tabindex="-1">
	{@render children()}
</main>

<SiteFooter />

<style>
	main {
		/* The skip target must not draw its own ring — this focus is a scroll
		   destination, not an interactive control. */
		outline: none;
	}
</style>
