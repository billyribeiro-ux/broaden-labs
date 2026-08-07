import type { Service } from './schema.ts';

/**
 * The six service areas. Brief §28, §40–46.
 *
 * Authored content — this is Broaden describing its own capabilities, so there
 * is no isDemo flag and nothing here is gated. Every detail page gets its own
 * hero, its own section headline and its own motif, because §40 is explicit:
 * "Do not make six identical pages with the nouns changed."
 */
export const SERVICES: readonly Service[] = [
	{
		slug: 'product-engineering',
		number: '01',
		name: 'Product Engineering',
		title: 'Product Engineering',
		cardHeadline: 'Custom software without the custom-software chaos.',
		cardCopy:
			'We design and engineer web applications around your actual workflows, users, constraints, and growth model—not around the limitations of a template or off-the-shelf platform.',
		capabilities: [
			'Product architecture',
			'Web applications',
			'Internal platforms',
			'API development',
			'Workflow systems',
			'Third-party integrations'
		],
		heroHeadline: 'Software shaped around the work—not the other way around.',
		heroIntro: [
			'Off-the-shelf platforms are excellent until your advantage depends on doing something they were never designed to do.',
			'Broaden designs and engineers custom applications around the workflows, decisions, data, and user experience that make your organization different.'
		],
		sectionHeadline: 'The product is more than the interface.',
		sectionCopy: [
			'We connect interface architecture, domain logic, APIs, permissions, integrations, data modeling, testing, observability, and deployment into one coherent application system.'
		],
		fitsWhen: [
			'the workflow is unique',
			'existing software creates operational friction',
			'multiple internal systems need to become one experience',
			'performance or usability is becoming a competitive constraint',
			'the product needs a foundation for continued development'
		],
		ctaLabel: 'Build the right system',
		metaTitle: 'Product Engineering | Broaden Labs',
		metaDescription:
			'Custom software and web application engineering for organizations whose workflows, products, and growth demand more than off-the-shelf tools.',
		motif: 'lattice'
	},

	{
		slug: 'saas-platforms',
		number: '02',
		name: 'SaaS Platforms',
		title: 'SaaS Platforms',
		cardHeadline: 'Build the product. Not the technical debt.',
		cardCopy:
			'From multi-tenant architecture and permissions to subscriptions, onboarding, dashboards, and operational tooling, we engineer SaaS products with the foundations required to keep evolving after launch.',
		capabilities: [
			'Multi-tenancy',
			'Authentication',
			'Billing architecture',
			'Roles & permissions',
			'Product analytics',
			'Admin systems'
		],
		heroHeadline: 'A SaaS product should be easy to use and difficult to outgrow.',
		heroIntro: [
			'Multi-tenant software becomes complicated quickly.',
			'Plans become permissions. Customers become organizations. One workflow becomes ten.',
			'Broaden engineers the underlying product architecture so growth adds capability instead of chaos.'
		],
		sectionHeadline: 'Foundations before features become liabilities.',
		sectionCopy: [
			'The parts of a SaaS product that decide whether year three is comfortable or expensive are almost never the parts on the roadmap in year one.'
		],
		fitsWhen: [
			'tenancy and permissions are starting to conflict',
			'billing logic is spreading across the codebase',
			'onboarding is the reason trials do not convert',
			'admin work is being done directly in the database',
			'usage data cannot answer product questions'
		],
		ctaLabel: 'Design the foundation',
		metaTitle: 'SaaS Platforms | Broaden Labs',
		metaDescription:
			'Multi-tenant SaaS architecture, permissions, billing, onboarding and admin tooling engineered so growth adds capability instead of complexity.',
		motif: 'strata'
	},

	{
		slug: 'real-time-systems',
		number: '03',
		name: 'Real-Time Systems',
		title: 'Real-Time Systems',
		cardHeadline: `When "eventually" isn't fast enough.`,
		cardCopy:
			'Trading interfaces, live operations, collaboration, alerts, presence, streaming, messaging, and synchronized application state demand a different class of engineering. We design for the moment data becomes action.',
		capabilities: [
			'WebSockets',
			'WebRTC',
			'Live dashboards',
			'Streaming interfaces',
			'Notifications',
			'Event-driven systems'
		],
		heroHeadline: 'Design for the moment information changes.',
		heroIntro: [
			'Some products cannot wait for refresh.',
			'Markets move. Teams collaborate. Alerts fire. Devices report. Streams continue.',
			'Real-time products require the interface, transport, state model, reliability strategy, and infrastructure to be designed together.'
		],
		sectionHeadline: `Fast isn't the same as real-time.`,
		sectionCopy: [
			'The difficult part is not opening a WebSocket.',
			'It is deciding what happens when messages arrive late, connections disappear, events reorder, users reconnect, state diverges, permissions change, or thousands of updates compete for attention.',
			`That's where architecture becomes experience.`
		],
		fitsWhen: [
			'stale data has a measurable cost',
			'multiple people act on the same record at once',
			'reconnection currently means a full page reload',
			'alert volume has outgrown human attention',
			'the interface updates faster than anyone can read it'
		],
		ctaLabel: 'Discuss the system',
		metaTitle: 'Real-Time Systems | Broaden Labs',
		metaDescription:
			'WebSocket and event-driven architecture, live dashboards, presence and streaming interfaces engineered for reliability under real network conditions.',
		motif: 'pulse'
	},

	{
		slug: 'ai-automation',
		number: '04',
		name: 'AI & Automation',
		title: 'AI & Automation',
		cardHeadline: 'Intelligence should remove work—not add another chatbot.',
		cardCopy:
			'We integrate machine intelligence where it creates measurable operational leverage: extracting information, assisting decisions, automating repetitive work, accelerating search, and orchestrating complex workflows.',
		capabilities: [
			'AI workflows',
			'LLM integrations',
			'Retrieval systems',
			'Agents',
			'Document intelligence',
			'Business automation'
		],
		heroHeadline: 'Put intelligence where the work actually happens.',
		heroIntro: [
			'AI becomes useful when it removes effort from an existing workflow—not when the product is rearranged around a chatbot.',
			'We identify high-leverage decisions and repetitive operations, then build intelligent capabilities into the systems people already need to use.'
		],
		sectionHeadline: 'Start with leverage, not novelty.',
		sectionCopy: [
			'Not every product needs AI, and saying so is part of the job. Where it does belong, the interesting engineering is in the surrounding experience: confidence, provenance, human review, failure states, permissions and observability.'
		],
		fitsWhen: [
			'people are re-keying information between systems',
			'a decision depends on reading a lot of unstructured text',
			'search returns documents when it should return answers',
			'a process is well understood but tedious',
			'review capacity, not model quality, is the bottleneck'
		],
		ctaLabel: 'Find the leverage',
		metaTitle: 'AI & Automation | Broaden Labs',
		metaDescription:
			'Retrieval, extraction, agents and workflow automation built into the systems people already use — with confidence, provenance and human review designed in.',
		motif: 'gradientless-flow'
	},

	{
		slug: 'platform-modernization',
		number: '05',
		name: 'Platform Modernization',
		title: 'Platform Modernization',
		cardHeadline: 'Keep what works. Replace what holds you back.',
		cardCopy:
			'Legacy systems rarely need a dramatic rewrite for its own sake. We identify the constraints that are slowing the product down, modernize deliberately, and create a path forward without gambling the business on a big-bang migration.',
		capabilities: [
			'Architecture audits',
			'Legacy modernization',
			'Performance',
			'Migration strategy',
			'Cloud infrastructure',
			'Observability'
		],
		heroHeadline: 'Modernize without betting the company on a rewrite.',
		heroIntro: [
			`Old software isn't automatically bad software.`,
			'The question is whether its architecture is preventing the business from moving.',
			'We identify the constraints that actually matter, define the safest modernization sequence, and improve the system while keeping the business operational.'
		],
		sectionHeadline: 'Replace constraints, not history.',
		sectionCopy: [
			'A rewrite is the most expensive way to discover what a system actually did. Modernization that works starts by finding the two or three constraints doing the real damage, and removing those first.'
		],
		fitsWhen: [
			'a small change takes weeks for reasons nobody can explain',
			'the deployment process is the reason releases are rare',
			'performance is degrading faster than usage is growing',
			'one component blocks every other improvement',
			'a full rewrite has already been attempted once'
		],
		ctaLabel: 'Audit the constraints',
		metaTitle: 'Platform Modernization | Broaden Labs',
		metaDescription:
			'Architecture audits, legacy modernization and migration strategy that remove the constraints slowing a product down without a big-bang rewrite.',
		motif: 'substrate'
	},

	{
		slug: 'product-design-systems',
		number: '06',
		name: 'Product Design Systems',
		title: 'Product Design Systems',
		cardHeadline: 'Design that survives implementation.',
		cardCopy:
			'We connect product thinking, interaction design, UI systems, motion, accessibility, and frontend architecture so the finished interface retains the clarity and quality of the original idea.',
		capabilities: [
			'UX architecture',
			'UI design',
			'Design systems',
			'Prototyping',
			'Motion systems',
			'Accessibility'
		],
		heroHeadline: 'Design systems for products that have somewhere to go.',
		heroIntro: [
			'A design system is not a gallery of buttons.',
			'It is a shared language connecting brand, interaction, accessibility, states, data density, motion, responsive behavior, and implementation.',
			'We build systems that help teams move faster without making every product look generic.'
		],
		sectionHeadline: 'The states nobody designs are the ones users find.',
		sectionCopy: [
			'Default, hover, focus-visible, active, disabled, loading, error, empty, selected. A system that only describes the first of those is a style guide, and the gap gets filled improvisationally by whoever ships next.'
		],
		fitsWhen: [
			'the same component exists four times with small differences',
			'design and implementation have visibly drifted',
			'accessibility is being retrofitted per feature',
			'motion is decided per screen',
			'a second product needs to share the first one’s language'
		],
		ctaLabel: 'Build the language',
		metaTitle: 'Product Design Systems | Broaden Labs',
		metaDescription:
			'UX architecture, UI systems, motion and accessibility connected to frontend implementation, so the finished interface keeps the clarity of the original idea.',
		motif: 'systemgrid'
	}
];

export function serviceBySlug(slug: string): Service | undefined {
	return SERVICES.find((service) => service.slug === slug);
}
