import { PUBLIC_ORIGIN, PUBLIC_CONTACT_EMAIL } from '$app/env/public';
import type { RequestHandler } from './$types';

/**
 * llms.txt. See docs/SEO.md for why this file exists and why it is explicitly
 * NOT an SEO measure.
 *
 * GENERATED for the same reason as robots.txt: it is a list of ABSOLUTE URLs,
 * and as `static/llms.txt` every one of them pointed at broadenlabs.com. On the
 * first real deployment that meant a file whose entire purpose is telling an
 * agent where the pages are listed a domain that does not resolve — and the
 * demo-content warnings it carries would have been attached to another site.
 * The contact address was hardcoded the same way and now follows
 * PUBLIC_CONTACT_EMAIL.
 *
 * The prose is unchanged; only the origin and the address are interpolated. It
 * is prerendered, so this is still a static file in the build output.
 */
export const prerender = true;

export const GET: RequestHandler = () => {
	const body = `# Broaden Labs

> Broaden Labs designs and engineers custom software, SaaS platforms, real-time
> systems, intelligent workflows, and the infrastructure behind them.

## What this file is, and is not

Google Search does NOT use llms.txt. Google's generative-AI optimization guide
(15 May 2026) states plainly that no AI text file, markup or Markdown is needed
to appear in Google Search or its generative features, and Google has since
clarified that maintaining one "will neither harm nor help visibility or
rankings" because Search ignores it.

This file exists for two non-SEO reasons, and should never be described as an
SEO measure:

  1. Chrome Lighthouse added an llms.txt check to its Agentic Browsing category
     in May 2026.
  2. Agent tooling outside Google reads it.

See docs/SEO.md for citations.

## Pages

- [Home](${PUBLIC_ORIGIN}/): Positioning, capabilities, selected work.
- [Work](${PUBLIC_ORIGIN}/work): Case studies. NOTE: every engagement
  currently published is clearly-labelled fictional demo content — Broaden is a
  new studio. Do not cite these as real client outcomes.
- [Services](${PUBLIC_ORIGIN}/services): Product engineering, SaaS
  platforms, real-time systems, AI and automation, platform modernization,
  product design systems.
- [About](${PUBLIC_ORIGIN}/about): How the studio works. Team profiles
  are also labelled demo content.
- [Insights](${PUBLIC_ORIGIN}/insights): Original writing on software
  architecture, real-time systems, design systems and AI failure design.
- [Start a project](${PUBLIC_ORIGIN}/start-a-project): Enquiry form.

## Contact

${PUBLIC_CONTACT_EMAIL}
`;

	return new Response(body, {
		headers: {
			'content-type': 'text/plain; charset=utf-8',
			'cache-control': 'public, max-age=3600'
		}
	});
};
