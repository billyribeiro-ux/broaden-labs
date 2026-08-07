import { test, expect } from '@playwright/test';

/**
 * SEO output. Brief §84, §85, §86.
 *
 * Asserted against the RAW HTML response, not the hydrated DOM — a crawler
 * receives the former, and `<svelte:head>` content injected after hydration
 * would pass a DOM assertion while being invisible to the thing that matters.
 *
 * Every rule tested here is cited in docs/SEO.md, researched 7 August 2026.
 */

const ROUTES = [
	'/',
	'/work',
	'/services',
	'/about',
	'/insights',
	'/start-a-project',
	'/work/meridian-markets',
	'/services/product-engineering',
	'/insights/ai-features-need-failure-design'
] as const;

const NOINDEX_ROUTES = ['/privacy', '/terms', '/accessibility'] as const;

function jsonLdBlocks(html: string): unknown[] {
	const matches = [...html.matchAll(/application\/ld\+json">(.*?)</gs)];
	return matches.map((match) => JSON.parse(match[1] ?? '{}'));
}

test.describe('every indexable route', () => {
	for (const route of ROUTES) {
		test(`${route} emits complete, unique metadata`, async ({ request }) => {
			const html = await (await request.get(route)).text();

			expect(html, 'title').toMatch(/<title>[^<]{10,}<\/title>/);
			expect(html, 'description').toMatch(/name="description" content="[^"]{50,}"/);
			expect(html, 'canonical').toContain('rel="canonical"');

			// og:image and og:url must be ABSOLUTE — a relative OG image is the
			// single most common reason a link preview renders blank.
			expect(html).toMatch(/property="og:image" content="https?:\/\//);
			expect(html).toMatch(/property="og:url" content="https?:\/\//);
			expect(html).toContain('name="twitter:card" content="summary_large_image"');

			/**
			 * max-image-preview defaults to `standard`; `large` is what permits a
			 * full-width preview in Search, Images, Discover and Assistant.
			 */
			expect(html, 'robots directives').toMatch(/name="robots"[^>]*max-image-preview:large/);

			/**
			 * Google's robots-meta documentation states these "aren't used by Google
			 * Search and are ignored". Emitting them is cargo cult, and this test
			 * exists so nobody adds them back.
			 */
			expect(html).not.toContain('noarchive');
			expect(html).not.toContain('nositelinkssearchbox');
		});
	}

	test('titles and descriptions are unique across routes', async ({ request }) => {
		const seen = new Map<string, string>();
		for (const route of ROUTES) {
			const html = await (await request.get(route)).text();
			const title = /<title>([^<]+)<\/title>/.exec(html)?.[1] ?? '';
			expect(title.length, `${route} has no title`).toBeGreaterThan(10);

			const duplicate = seen.get(title);
			expect(duplicate, `${route} duplicates the title of ${duplicate}`).toBeUndefined();
			seen.set(title, route);
		}
	});
});

test.describe('structured data', () => {
	test('Organization and WebSite are present and reference each other', async ({ request }) => {
		const blocks = jsonLdBlocks(await (await request.get('/')).text());
		const types = blocks.map((b) => (b as { '@type': string })['@type']);

		expect(types).toContain('Organization');
		expect(types).toContain('WebSite');

		const site = blocks.find((b) => (b as { '@type': string })['@type'] === 'WebSite') as {
			publisher?: { '@id'?: string };
		};
		expect(site.publisher?.['@id']).toContain('#organization');
	});

	test('the preferred image is declared in schema as well as og:image', async ({ request }) => {
		// Google's March 2026 guidance: the Search/Discover thumbnail can be
		// steered with og:image AND schema.org. Both are emitted because different
		// surfaces read different ones.
		const blocks = jsonLdBlocks(await (await request.get('/')).text());
		const page = blocks.find((b) => (b as { '@type': string })['@type'] === 'WebPage') as {
			primaryImageOfPage?: { url?: string };
		};
		expect(page?.primaryImageOfPage?.url).toMatch(/^https?:\/\/.*\.png$/);
	});

	test('an article emits Article with a date and author', async ({ request }) => {
		const blocks = jsonLdBlocks(
			await (await request.get('/insights/ai-features-need-failure-design')).text()
		);
		const article = blocks.find((b) => (b as { '@type': string })['@type'] === 'Article') as {
			datePublished?: string;
			author?: { name?: string };
			headline?: string;
		};

		expect(article?.headline).toBeTruthy();
		expect(article?.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		expect(article?.author?.name).toBeTruthy();
	});

	test('nested routes emit a BreadcrumbList starting at Home', async ({ request }) => {
		const blocks = jsonLdBlocks(await (await request.get('/work/meridian-markets')).text());
		const crumbs = blocks.find((b) => (b as { '@type': string })['@type'] === 'BreadcrumbList') as {
			itemListElement?: { position: number; name: string }[];
		};

		expect(crumbs?.itemListElement?.[0]?.name).toBe('Home');
		expect(crumbs?.itemListElement?.map((i) => i.name)).toContain('Work');
	});

	/**
	 * Brief §84 forbids fabricating ratings, reviews, awards, customer counts and
	 * locations. Broaden has none of these, so asserting any in markup would be
	 * inventing a credential — the same offence as an invented testimonial, in a
	 * place nobody looks.
	 *
	 * FAQPage is also checked: Google deprecated FAQ rich results on 7 May 2026
	 * and it is dead markup as of now.
	 */
	test('no fabricated credentials and no dead markup anywhere', async ({ request }) => {
		for (const route of ROUTES) {
			const html = await (await request.get(route)).text();
			for (const forbidden of [
				'aggregateRating',
				'"review"',
				'ratingValue',
				'"award"',
				'numberOfEmployees',
				'FAQPage',
				'"Dataset"'
			]) {
				expect(html, `${route} contains ${forbidden}`).not.toContain(forbidden);
			}
		}
	});
});

test.describe('crawl surface', () => {
	test('the sitemap lists every indexable route and no unwritten ones', async ({ request }) => {
		const xml = await (await request.get('/sitemap.xml')).text();

		expect(xml).toContain('http://www.sitemaps.org/schemas/sitemap/0.9');
		for (const route of ROUTES) {
			expect(xml, `sitemap is missing ${route}`).toContain(`${route}</loc>`);
		}
		// The legal pages say no policy has been written yet. Asking a search
		// engine to index that advertises the gap.
		for (const route of NOINDEX_ROUTES) {
			expect(xml, `sitemap should not list ${route}`).not.toContain(`${route}</loc>`);
		}
	});

	test('unwritten legal pages are noindex', async ({ request }) => {
		for (const route of NOINDEX_ROUTES) {
			const html = await (await request.get(route)).text();
			expect(html, `${route} should be noindex`).toMatch(/name="robots" content="noindex/);
		}
	});

	test('robots.txt points at the sitemap and shields the remote endpoints', async ({ request }) => {
		const txt = await (await request.get('/robots.txt')).text();
		expect(txt).toContain('Sitemap: https://broadenlabs.com/sitemap.xml');
		expect(txt).toContain('Disallow: /_app/');
	});

	test('llms.txt states plainly that it is not an SEO measure', async ({ request }) => {
		// Google Search ignores llms.txt entirely. The file is shipped for Chrome
		// Lighthouse's Agentic Browsing audit and non-Google agent tooling, and it
		// says so — so nobody later mistakes it for a ranking mechanism.
		const txt = await (await request.get('/llms.txt')).text();
		expect(txt).toContain('Google Search does NOT use llms.txt');
		// It must also warn agents that the case studies are fictional.
		expect(txt).toContain('fictional demo content');
	});
});
