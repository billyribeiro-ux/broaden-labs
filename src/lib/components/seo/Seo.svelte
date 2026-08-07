<script lang="ts">
	import { page } from '$app/state';
	import { PUBLIC_ORIGIN } from '$app/env/public';

	/**
	 * Per-route metadata and structured data. Brief §84, §85, §86.
	 *
	 * One component so no route can ship without a canonical URL or an OG image,
	 * and so the shapes stay consistent — the usual failure is three routes with
	 * three slightly different OG tag sets.
	 *
	 * `PUBLIC_ORIGIN` is a STATIC env var and deliberately the production origin
	 * even on preview deployments: a canonical pointing at a preview URL is how
	 * preview builds end up indexed instead of the real site.
	 */
	type Kind = 'website' | 'article';

	interface Props {
		title: string;
		description: string;
		kind?: Kind;
		/** Overrides the default social image. */
		image?: string | undefined;
		/** Article metadata; ignored for `website`. */
		published?: string | undefined;
		author?: string | undefined;
		/** Set on routes that must never be indexed. */
		noindex?: boolean;
		/** Breadcrumb trail, innermost last. Home is prepended automatically. */
		breadcrumbs?: readonly { readonly name: string; readonly href: string }[];
	}

	let {
		title,
		description,
		kind = 'website',
		image,
		published,
		author,
		noindex = false,
		breadcrumbs = []
	}: Props = $props();

	const canonical = $derived(`${PUBLIC_ORIGIN}${page.url.pathname}`);
	const socialImage = $derived(`${PUBLIC_ORIGIN}${image ?? '/og/default.png'}`);

	/**
	 * Organization and WebSite, emitted once from the root.
	 *
	 * Brief §84 forbids fabricating ratings, reviews, awards, customer counts and
	 * locations — so none of `aggregateRating`, `review`, `award`, `address` or
	 * `numberOfEmployees` appears here. `ProfessionalService` is also omitted: it
	 * implies a service area and opening hours the studio has not published.
	 * What is asserted is only what is true.
	 */
	const organisation = $derived({
		'@context': 'https://schema.org',
		'@type': 'Organization',
		'@id': `${PUBLIC_ORIGIN}/#organization`,
		name: 'Broaden Labs',
		url: PUBLIC_ORIGIN,
		description:
			'Broaden Labs designs and engineers custom software, SaaS platforms, real-time systems and intelligent workflows.',
		logo: `${PUBLIC_ORIGIN}/og/default.png`
	});

	/**
	 * The preferred-image mechanism Google documented on 2 March 2026: a page's
	 * Search and Discover thumbnail can be steered with `og:image` AND
	 * schema.org, via `primaryImageOfPage` or an `image` on the mainEntity.
	 * Both are emitted, because they are read by different surfaces.
	 */
	const webPage = $derived({
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		'@id': canonical,
		url: canonical,
		name: title,
		description,
		isPartOf: { '@id': `${PUBLIC_ORIGIN}/#website` },
		primaryImageOfPage: { '@type': 'ImageObject', url: socialImage }
	});

	const website = $derived({
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		'@id': `${PUBLIC_ORIGIN}/#website`,
		url: PUBLIC_ORIGIN,
		name: 'Broaden Labs',
		publisher: { '@id': `${PUBLIC_ORIGIN}/#organization` }
	});

	const article = $derived(
		kind === 'article'
			? {
					'@context': 'https://schema.org',
					'@type': 'Article',
					headline: title,
					description,
					image: socialImage,
					datePublished: published,
					author: author ? { '@type': 'Person', name: author } : undefined,
					publisher: { '@id': `${PUBLIC_ORIGIN}/#organization` },
					mainEntityOfPage: canonical
				}
			: null
	);

	const breadcrumbList = $derived(
		breadcrumbs.length > 0
			? {
					'@context': 'https://schema.org',
					'@type': 'BreadcrumbList',
					itemListElement: [{ name: 'Home', href: '/' }, ...breadcrumbs].map((crumb, index) => ({
						'@type': 'ListItem',
						position: index + 1,
						name: crumb.name,
						item: `${PUBLIC_ORIGIN}${crumb.href}`
					}))
				}
			: null
	);

	/**
	 * JSON.stringify drops undefined properties, which is what keeps optional
	 * article fields out of the payload rather than emitting `"author": null`.
	 * Every `<` is escaped to its unicode form because a closing-script-tag
	 * sequence appearing inside JSON-LD data would terminate the tag early and
	 * turn the remainder of the payload into markup. That is the classic JSON-LD
	 * injection, and it is why the sequence is described here in words rather
	 * than written out — a literal one in a comment closes the block just as
	 * effectively as one in a string.
	 */
	function ld(data: unknown): string {
		return JSON.stringify(data).replace(/</g, '\\u003c');
	}

	/**
	 * The JSON-LD tags are assembled HERE rather than in the template.
	 *
	 * Two reasons. Svelte hoists a literal script element written in markup, so
	 * the `{@html}` string is the only way to emit one — and eslint-plugin-svelte's
	 * parser sees that literal opening tag inside a template expression and tries
	 * to parse it as a second instance script, which is a parse error. Building
	 * the string in the instance block leaves no tag text in the template at all.
	 *
	 * The parts are concatenated from a const so the opening tag never appears as
	 * a contiguous literal that a parser could mistake for a real element.
	 */
	const LD_OPEN = '<' + 'script type="application/ld+json">';
	const LD_CLOSE = '<' + '/script>';

	const jsonLd = $derived(
		[organisation, website, webPage, article, breadcrumbList]
			.filter((graph) => graph !== null && graph !== undefined)
			.map((graph) => `${LD_OPEN}${ld(graph)}${LD_CLOSE}`)
			.join('')
	);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />

	<!--
		max-image-preview defaults to `standard`. `large` permits "a larger image
		preview, up to the width of the viewport" across Google web search, Google
		Images, Discover and Assistant — the cheapest Discover-eligibility win
		available. max-snippet:-1 and max-video-preview:-1 remove the length caps.

		Deliberately NOT emitted: noarchive, nocache and nositelinkssearchbox.
		Google's robots-meta documentation states these "aren't used by Google
		Search and are ignored", so emitting them is cargo cult.

		See docs/SEO.md for the citations.
	-->
	{#if noindex}
		<meta name="robots" content="noindex, follow" />
	{:else}
		<meta
			name="robots"
			content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
		/>
	{/if}

	<meta property="og:type" content={kind} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={socialImage} />
	<meta property="og:site_name" content="Broaden Labs" />
	<meta property="og:locale" content="en_GB" />

	<!-- summary_large_image, not summary: the OG artwork is 1200x630 and the
	     small card would centre-crop it into an unreadable square. -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={socialImage} />

	<!--
		svelte/no-at-html-tags is correct in general and does not apply here.

		This is the only way to emit a script element from Svelte markup, and the
		content is not user input: every value comes from typed content modules and
		route props, is serialised by JSON.stringify, and has each `<` escaped to
		its unicode form — which is precisely the mitigation for the injection the
		rule guards against. Nothing reaches this string from a request, a form or
		a database row.
	-->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html jsonLd}
</svelte:head>
