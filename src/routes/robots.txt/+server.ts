import { PUBLIC_ORIGIN } from '$app/env/public';
import type { RequestHandler } from './$types';

/**
 * robots.txt. Brief §84.
 *
 * GENERATED, not a static file, for one reason: the `Sitemap:` line is an
 * absolute URL and it must agree with the origin the rest of the site claims.
 *
 * As `static/robots.txt` it hardcoded `https://broadenlabs.com/sitemap.xml`,
 * so the first real deployment served a robots.txt pointing crawlers at a
 * sitemap on a domain that does not resolve, while every canonical, og:url and
 * sitemap entry on the same site correctly used PUBLIC_ORIGIN. Verified live on
 * the deployment before this change.
 *
 * Prerendered, so it is still a static file in the output — just one whose
 * origin cannot drift from the sitemap's.
 */
export const prerender = true;

export const GET: RequestHandler = () => {
	const body = `# Broaden Labs

User-agent: *
Allow: /

# Remote function endpoints are an implementation detail, not a public API, and
# they respond only to POST. Crawling them wastes budget and produces nothing.
Disallow: /_app/

Sitemap: ${PUBLIC_ORIGIN}/sitemap.xml
`;

	return new Response(body, {
		headers: {
			'content-type': 'text/plain; charset=utf-8',
			'cache-control': 'public, max-age=3600'
		}
	});
};
