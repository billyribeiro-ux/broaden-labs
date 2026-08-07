import type { Principle, ProcessStep, Value } from './schema.ts';

/**
 * Authored narrative content — brief §26, §27, §34–36, §53.
 *
 * Broaden describing its own thinking. No isDemo flag: nothing here is a claim
 * about a third party, so nothing here is gated.
 */

export const STATEMENT = {
	headline: `We don't build websites around technology.`,
	follow: 'We build technology around what the product needs to become.',
	body: [
		'The strongest digital products are not assembled from a checklist of features. They emerge from clear thinking about the business, the user, the system, and the decisions connecting all three.',
		'Broaden brings product strategy, experience design, software engineering, and technical architecture into one continuous process—so the idea survives contact with implementation.'
	]
} as const;

export const CAPABILITY_INTRO = {
	eyebrow: 'What we build',
	headline: 'From first principle to production.',
	body: `Whether we're shaping a product from zero, rebuilding an aging platform, or engineering one difficult layer of a larger system, we focus on the same outcome: software that feels obvious to use and difficult to outgrow.`
} as const;

export const WORK_INTRO = {
	eyebrow: 'Selected work',
	headline: 'Products built around the hard part.',
	body: [
		'The interface matters. So does everything behind it.',
		'Our work focuses on products where experience, systems thinking, and engineering have to function as one.'
	]
} as const;

export const PHILOSOPHY = {
	eyebrow: 'How we think',
	headline: 'Complexity belongs in the engineering. Not in the experience.',
	body: [
		'Great software can solve difficult problems without making the user feel the difficulty.',
		'That requires more than a polished interface.',
		'It requires data models that reflect reality. Architecture that leaves room to evolve. Interactions that explain themselves. Systems that fail predictably. Performance that disappears into the experience.',
		'The details users never see determine the quality they feel.'
	]
} as const;

export const PRINCIPLES: readonly Principle[] = [
	{
		number: '01',
		title: 'Understand before building.',
		body: [
			`We don't begin with screens.`,
			'We begin with the business model, users, workflows, constraints, data, risks, and definition of success.'
		]
	},
	{
		number: '02',
		title: 'Architecture is product design.',
		body: [
			'A technical decision eventually becomes a user experience decision.',
			'Performance, reliability, permissions, data modeling, and integration strategy belong in product conversations from the beginning.'
		]
	},
	{
		number: '03',
		title: 'Reduce before adding.',
		body: [
			'More functionality is not automatically more product.',
			'We look for the smallest system that can solve the whole problem elegantly.'
		]
	},
	{
		number: '04',
		title: 'Build for change.',
		body: [
			'Requirements change. Markets change. Teams change.',
			'The architecture should expect that.'
		]
	},
	{
		number: '05',
		title: 'Quality compounds.',
		body: [
			'Good naming. Clear types. Predictable components. Accessible interactions. Useful tests. Thoughtful motion.',
			'Small decisions accumulate into software people trust.'
		]
	}
];

export const PROCESS_INTRO = {
	eyebrow: 'The Broaden process',
	headline: 'Clear thinking. Then velocity.',
	body: 'Every engagement is different. The disciplines are not.'
} as const;

export const PROCESS: readonly ProcessStep[] = [
	{
		number: '01',
		name: 'Discover',
		headline: 'Find the real problem.',
		copy: 'We map users, workflows, business objectives, technical constraints, systems, data, assumptions, and risks.',
		outputs: [
			'stakeholder interviews',
			'workflow mapping',
			'technical audit',
			'competitive research',
			'product requirements',
			'risk register'
		]
	},
	{
		number: '02',
		name: 'Define',
		headline: 'Turn ambiguity into decisions.',
		copy: 'We define what the product needs to do, what it should not do yet, how success will be measured, and how the system needs to behave.',
		outputs: [
			'product strategy',
			'information architecture',
			'technical architecture',
			'delivery roadmap',
			'experience principles'
		]
	},
	{
		number: '03',
		name: 'Design',
		headline: 'Make the complex feel inevitable.',
		copy: 'UX, visual systems, interaction, motion, states, accessibility, and responsive behavior are designed together—not handed from one discipline to another.',
		outputs: [
			'UX flows',
			'UI system',
			'interactive prototypes',
			'motion direction',
			'design tokens'
		]
	},
	{
		number: '04',
		name: 'Engineer',
		headline: 'Build the version people can depend on.',
		copy: 'Frontend, backend, integrations, data models, infrastructure, observability, security controls, automated tests, and deployment are treated as one production system.',
		outputs: [
			'application system',
			'data model',
			'test suite',
			'observability',
			'deployment pipeline'
		]
	},
	{
		number: '05',
		name: 'Evolve',
		headline: 'Launch is when the useful information starts.',
		copy: 'Real usage exposes what no planning document can. We measure, learn, improve, and help the product expand without losing the clarity of its foundation.',
		outputs: ['usage analysis', 'performance review', 'iteration plan', 'architecture review']
	}
];

export const TECHNOLOGY = {
	headline: 'Technology is a means. Capability is the outcome.',
	body: 'We choose technology according to the product—not according to a sales partnership, a preferred buzzword, or the framework someone learned last year.',
	labels: [
		'Svelte',
		'SvelteKit',
		'TypeScript',
		'Node.js',
		'PostgreSQL',
		'Drizzle',
		'WebRTC',
		'WebSockets',
		'Three.js',
		'GSAP',
		'Cloud Infrastructure',
		'AI Systems'
	]
} as const;

export const CLOSING = {
	headline: `What's the thing your software should make possible?`,
	body: `Bring us the product you're trying to create, the system that's holding you back, or the problem nobody has made simple yet.`,
	small: 'No pitch deck required. A clear problem is enough.'
} as const;

export const FINAL_BRAND_MOMENT = {
	headline: 'Build beyond what the product is today.',
	body: [
		`The next version of your business may require software that doesn't exist yet.`,
		`That's what we build.`
	]
} as const;

/* ── About page ──────────────────────────────────────────────────────────── */

export const ABOUT_MANIFESTO = {
	headline: 'Software changes what an organization is capable of doing.',
	body: [
		`That's why we don't treat development as order fulfillment.`,
		'The job is not to translate a requirements document into screens.',
		'The job is to understand what the organization is trying to make possible—and then design the product, architecture, and implementation capable of carrying that ambition.'
	]
} as const;

export const WHY_BROADEN = {
	headline: 'Why "Broaden"?',
	body: [
		'To broaden is to increase the range of what is possible.',
		'A better workflow broadens what a team can accomplish.',
		'A better platform broadens what a business can offer.',
		'A better architecture broadens how far a product can evolve.',
		'Technology matters when it creates room to move.',
		`That's the idea behind the name.`
	]
} as const;

export const VALUES: readonly Value[] = [
	{
		title: 'Think in systems.',
		body: [
			'A screen is connected to a workflow. A workflow is connected to data. Data is connected to architecture. Architecture is connected to the business.',
			'We design with the whole system in view.'
		]
	},
	{
		title: 'Make complexity earn its place.',
		body: ['Sophistication is useful. Complication is expensive.', 'We know the difference.']
	},
	{
		title: 'Care after it works.',
		body: [
			'"Functional" is the beginning.',
			'The spacing. The empty state. The error message. The loading behavior. The keyboard path. The response time.',
			'The final ten percent determines how the product feels.'
		]
	},
	{
		title: 'Explain the decisions.',
		body: [
			`Good partnerships don't depend on mystery.`,
			'We communicate the reasoning behind recommendations so teams can make better decisions long after an engagement ends.'
		]
	}
];
