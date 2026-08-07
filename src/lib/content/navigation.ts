/**
 * Site navigation structure. Brief §21, §61.
 *
 * One source of truth: the header, the mobile menu, the footer and the
 * route-inventory test all read from here, so a route can never appear in one
 * and be missing from another.
 */

export interface NavLink {
	readonly label: string;
	readonly href: string;
}

export const PRIMARY_NAV: readonly NavLink[] = [
	{ label: 'Work', href: '/work' },
	{ label: 'Services', href: '/services' },
	{ label: 'About', href: '/about' },
	{ label: 'Insights', href: '/insights' }
];

export const PRIMARY_CTA: NavLink = { label: 'Start a project', href: '/start-a-project' };

export const CAPABILITY_NAV: readonly NavLink[] = [
	{ label: 'Product Engineering', href: '/services/product-engineering' },
	{ label: 'SaaS Platforms', href: '/services/saas-platforms' },
	{ label: 'Real-Time Systems', href: '/services/real-time-systems' },
	{ label: 'AI & Automation', href: '/services/ai-automation' },
	{ label: 'Platform Modernization', href: '/services/platform-modernization' },
	{ label: 'Product Design Systems', href: '/services/product-design-systems' }
];

export const LEGAL_NAV: readonly NavLink[] = [
	{ label: 'Privacy', href: '/privacy' },
	{ label: 'Terms', href: '/terms' },
	{ label: 'Accessibility', href: '/accessibility' }
];

/**
 * External profiles. These are placeholders and are marked as such — the brief
 * lists them as "[placeholder]" and inventing real URLs would be fabricating a
 * presence that does not exist. `href: null` renders as unlinked text rather
 * than a dead link.
 */
export interface ExternalLink {
	readonly label: string;
	readonly href: string | null;
}

export const CONNECT_LINKS: readonly ExternalLink[] = [
	{ label: 'LinkedIn', href: null },
	{ label: 'GitHub', href: null }
];

/**
 * True when `current` is `href` or a descendant of it, for aria-current.
 * `/work/meridian-markets` marks `/work` as the current section, but `/` only
 * ever matches itself — otherwise every route would mark home as current.
 */
export function isCurrentSection(current: string, href: string): boolean {
	if (href === '/') return current === '/';
	return current === href || current.startsWith(`${href}/`);
}
