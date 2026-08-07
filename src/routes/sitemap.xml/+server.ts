import { PUBLIC_ORIGIN } from '$app/env/public';
import { SERVICES } from '#lib/content/services';
import { INSIGHTS } from '#lib/content/insights';
import { CASE_STUDIES } from '#lib/content/demo/case-studies';
import type { RequestHandler } from './$types';

/**
 * Sitemap. Brief §84.
 *
 * Generated from the same content modules the routes render, so a new case
 * study or article cannot be published and left out. A hand-maintained list
 * drifts, and a sitemap that lies is worse than none.
 *
 * Prerendered: every URL is known at build time, so this is a static file in
 * the output rather than a function invocation per crawl.
 */
export const prerender = true;

interface Entry {
	readonly path: string;
	/** Relative to the rest of the site, not an absolute claim of importance. */
	readonly priority: string;
	readonly changefreq: 'monthly' | 'yearly';
}

const STATIC_ENTRIES: readonly Entry[] = [
	{ path: '/', priority: '1.0', changefreq: 'monthly' },
	{ path: '/work', priority: '0.9', changefreq: 'monthly' },
	{ path: '/services', priority: '0.9', changefreq: 'monthly' },
	{ path: '/about', priority: '0.7', changefreq: 'yearly' },
	{ path: '/insights', priority: '0.8', changefreq: 'monthly' },
	{ path: '/start-a-project', priority: '0.9', changefreq: 'yearly' }
];

/**
 * /privacy, /terms and /accessibility are deliberately ABSENT.
 *
 * They currently state that no policy has been written yet, and asking a search
 * engine to index a page that says "this does not exist yet" advertises the gap.
 * They carry `noindex` for the same reason. Add them here when they have content.
 */
export const GET: RequestHandler = () => {
	const entries: Entry[] = [
		...STATIC_ENTRIES,
		...SERVICES.map((service) => ({
			path: `/services/${service.slug}`,
			priority: '0.8' as const,
			changefreq: 'yearly' as const
		})),
		...CASE_STUDIES.map((study) => ({
			path: `/work/${study.slug}`,
			priority: '0.7' as const,
			changefreq: 'yearly' as const
		})),
		...INSIGHTS.map((insight) => ({
			path: `/insights/${insight.slug}`,
			priority: '0.6' as const,
			changefreq: 'yearly' as const
		}))
	];

	const urls = entries
		.map(
			(entry) =>
				`\t<url>\n\t\t<loc>${PUBLIC_ORIGIN}${entry.path}</loc>\n\t\t<changefreq>${entry.changefreq}</changefreq>\n\t\t<priority>${entry.priority}</priority>\n\t</url>`
		)
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

	return new Response(xml, {
		headers: {
			'content-type': 'application/xml',
			'cache-control': 'public, max-age=3600'
		}
	});
};
