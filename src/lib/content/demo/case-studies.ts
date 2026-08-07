import { registerContent } from '../safety.ts';
import type { CaseStudy } from '../schema.ts';

/**
 * FICTIONAL case studies. Brief §13, §30–32, §47.
 *
 * None of these clients exist. Every record is `isDemo: true` and registered
 * with the content-safety gate, which refuses a production build while any of
 * them is still enabled. The metrics in particular are invented to exercise the
 * Metric component — they are not measurements of anything.
 *
 * They are written as if real because a component preview full of "Lorem" tells
 * you nothing about whether the layout works. That is the trade the brief makes
 * explicit: invented DATA is fine, invented FUNCTIONALITY is not.
 */
export const CASE_STUDIES: readonly CaseStudy[] = registerContent([
	{
		isDemo: true,
		kind: 'caseStudy',
		id: 'meridian-markets',
		slug: 'meridian-markets',
		client: 'Meridian Markets',
		industry: 'FinTech',
		capabilities: ['Real-Time', 'Product Engineering', 'Product Design'],
		category: 'Financial Technology',
		project: 'Real-Time Market Intelligence Platform',
		headline: 'Turning live market data into decisions measured in seconds.',
		year: '2025',
		surface: 'command-center',
		summary: [
			'Meridian needed a trading intelligence environment capable of organizing high-velocity market information without burying users in dashboards.',
			'The product combines streaming data, configurable workspaces, event-driven alerts, collaborative annotations, and an interface designed for continuous use throughout the trading session.'
		],
		challenge: [
			`The challenge wasn't more data. It was knowing what deserved attention.`,
			'Meridian’s desk already received every feed it could buy. What it lacked was a way to tell, in the second an instrument moved, whether that movement mattered to the position someone was holding — without asking them to watch nine panels at once.'
		],
		approach: [
			'We modelled the desk’s actual attention budget first: how many things a trader can hold, how long a glance lasts, what warrants an interruption.',
			'That produced an architecture where the alert engine — not the interface — decides significance, and the workspace only renders what survived that filter. Application state is authoritative on the server, so a reconnect restores a session rather than reloading a page.'
		],
		outcome: [
			'Traders stopped navigating between monitoring contexts and started working inside one.',
			'The measurable change was not raw speed; it was how much of the session was spent reading rather than searching.'
		],
		metrics: [
			{ value: '68%', label: 'less time navigating between monitoring workflows' },
			{ value: '<250ms', label: 'target UI update path, feed to render' },
			{ value: '14', label: 'integrated real-time data views' }
		],
		services: [
			'Product Strategy',
			'UX Architecture',
			'Real-Time Engineering',
			'Design System',
			'Platform Architecture'
		]
	},

	{
		isDemo: true,
		kind: 'caseStudy',
		id: 'northstar-health',
		slug: 'northstar-health',
		client: 'Northstar Health',
		industry: 'Healthcare',
		capabilities: ['Product Engineering', 'Platform Modernization', 'Product Design'],
		category: 'Healthcare Operations',
		project: 'Clinical Operations Platform',
		headline: 'One operational picture for teams working from dozens of systems.',
		year: '2025',
		surface: 'operational-queue',
		summary: [
			'Northstar’s teams were managing critical operational workflows across disconnected tools, spreadsheets, inboxes, and legacy software.',
			'We designed a unified operational workspace that turns fragmented information into prioritized actions while preserving the controls required for sensitive environments.'
		],
		challenge: [
			'Coordination was happening in the gaps between systems, and the gaps were staffed by people.',
			'Every handoff that lived in an inbox was a handoff nobody could audit, measure, or safely automate — and in a clinical setting, an unauditable handoff is a risk before it is an inefficiency.'
		],
		approach: [
			'We mapped the real path of a task across all six systems before proposing a single screen.',
			'The workspace that resulted does not replace those systems. It reads from them, establishes one ordering of work, and writes back through interfaces that respect each system’s own permissions — so consolidation never became a second source of truth.'
		],
		outcome: [
			'Work that used to be reconstructed each morning from several tools arrives already ordered.',
			'The controls that make the environment defensible — audit trails, role boundaries, review steps — are part of the workflow rather than a layer on top of it.'
		],
		metrics: [
			{ value: '41%', label: 'fewer manual workflow steps' },
			{ value: '6', label: 'legacy workflows consolidated' },
			{ value: '2.8x', label: 'faster task triage' }
		],
		services: [
			'Product Discovery',
			'Application Engineering',
			'Workflow Automation',
			'Data Integration',
			'Accessibility'
		]
	},

	{
		isDemo: true,
		kind: 'caseStudy',
		id: 'vale-commerce',
		slug: 'vale-commerce',
		client: 'Vale Commerce',
		industry: 'Commerce',
		capabilities: ['Product Engineering', 'Product Design'],
		category: 'B2B Commerce',
		project: 'Commerce Operations Platform',
		headline: 'Making complex B2B transactions feel consumer-simple.',
		year: '2024',
		surface: 'purchasing-flow',
		summary: [
			'Vale needed a purchasing environment capable of handling negotiated pricing, account-specific catalogs, approvals, high-volume orders, and complex fulfillment without exposing that complexity to buyers.',
			'We redesigned the platform around progressive disclosure and built a composable system capable of supporting evolving commercial models.'
		],
		challenge: [
			'Every buyer saw the same interface, and that interface had to be correct for all of them.',
			'Negotiated pricing, contract catalogs and approval chains meant the "simple" path through the product was different for each account — so the product had been built to show everything, to everyone, always.'
		],
		approach: [
			'We separated what is true about an order from what a given account is permitted to see and do about it.',
			'Once that boundary existed, progressive disclosure stopped being a design preference and became a property of the data model: the interface shows a buyer their own commercial reality rather than the union of everyone’s.'
		],
		outcome: [
			'Ordering became shorter for buyers and, more consequentially, quieter for the support team.',
			'New commercial models are now configuration rather than a release.'
		],
		metrics: [
			{ value: '37%', label: 'shorter ordering flow' },
			{ value: '54%', label: 'reduction in support-assisted orders' },
			{ value: '3', label: 'regional storefronts on one platform' }
		],
		services: [
			'Product Strategy',
			'UX Architecture',
			'Application Engineering',
			'Design System',
			'Commerce Integration'
		]
	},

	{
		isDemo: true,
		kind: 'caseStudy',
		id: 'lumina-grid',
		slug: 'lumina-grid',
		client: 'Lumina Grid',
		industry: 'Operations',
		capabilities: ['Real-Time', 'Product Engineering', 'Platform Modernization'],
		category: 'Infrastructure / Data',
		project: 'Distributed Energy Operations Interface',
		headline: 'A spatial operations interface for distributed energy systems.',
		year: '2025',
		surface: 'spatial-grid',
		summary: [
			'Lumina operates thousands of distributed assets whose behaviour only makes sense in relation to where they are and what is happening around them.',
			'We built a spatial operations surface where geography, telemetry and dispatch decisions occupy one continuous interface instead of three.'
		],
		challenge: [
			'A table cannot express adjacency, and adjacency was the whole problem.',
			'Operators were mentally re-projecting rows of telemetry onto a map they knew from memory, which worked exactly until the day it mattered most.'
		],
		approach: [
			'We treated the map as the primary control surface rather than a visualisation of one.',
			'Telemetry streams into spatial aggregates rather than individual markers, so density stays legible as the estate grows; dispatch actions are issued from the same surface that shows their consequence.'
		],
		outcome: [
			'Operators reason about the estate the way it actually behaves — as a network with neighbours, not a list with rows.',
			'Response decisions and their spatial consequence now happen in one place.'
		],
		metrics: [
			{ value: '9,400', label: 'assets rendered without virtualisation fallback' },
			{ value: '<400ms', label: 'telemetry-to-map propagation target' },
			{ value: '3', label: 'operational surfaces collapsed into one' }
		],
		services: [
			'UX Architecture',
			'Real-Time Engineering',
			'Data Visualization',
			'Platform Architecture',
			'Performance'
		]
	},

	{
		isDemo: true,
		kind: 'caseStudy',
		id: 'arcwell',
		slug: 'arcwell',
		client: 'Arcwell',
		industry: 'SaaS',
		capabilities: ['Platform Modernization', 'Product Engineering', 'Product Design'],
		category: 'Enterprise SaaS',
		project: 'Operational Consolidation Platform',
		headline: 'Replacing five operational tools with one coherent workflow.',
		year: '2024',
		surface: 'workflow-console',
		summary: [
			'Arcwell had grown by acquisition, and its operations ran on the five products that came with it.',
			'We designed the consolidation sequence and built the platform that absorbed them, one workflow at a time, without a cutover weekend.'
		],
		challenge: [
			'Five tools meant five permission models, five notions of "customer", and five teams confident theirs was the correct one.',
			'The technical problem was reconciliation. The product problem was that any consolidation which made one team’s work worse would fail regardless of how good the architecture was.'
		],
		approach: [
			'We modelled the shared domain first and let each tool’s vocabulary map onto it, rather than declaring a winner.',
			'Migration ran workflow by workflow behind a routing layer, so each team moved when its own path was demonstrably better — and could be routed back if it was not.'
		],
		outcome: [
			'Consolidation happened incrementally and reversibly, which is why it finished.',
			'One domain model now serves every team, and new operational capability ships once instead of five times.'
		],
		metrics: [
			{ value: '5 → 1', label: 'operational tools consolidated' },
			{ value: '0', label: 'big-bang migration weekends' },
			{ value: '62%', label: 'reduction in duplicated operational data' }
		],
		services: [
			'Architecture Audit',
			'Migration Strategy',
			'Application Engineering',
			'Design System',
			'Observability'
		]
	},

	{
		isDemo: true,
		kind: 'caseStudy',
		id: 'helio-systems',
		slug: 'helio-systems',
		client: 'Helio Systems',
		industry: 'Emerging Tech',
		capabilities: ['AI', 'Real-Time', 'Product Design'],
		category: 'Emerging Technology',
		project: 'Autonomous Workflow Control Surface',
		headline: 'A control surface for complex autonomous workflows.',
		year: '2026',
		surface: 'control-surface',
		summary: [
			'Helio runs long-lived autonomous processes that mostly succeed and occasionally need a human.',
			'We designed the interface for that second case: knowing which process needs attention, what it was about to do, and what happens if you intervene.'
		],
		challenge: [
			'An autonomous system that is right 98% of the time creates a supervision problem, not a labour saving.',
			'Operators had no way to tell a process that was thinking from one that was stuck, and no way to inspect a decision without stopping it.'
		],
		approach: [
			'Every autonomous step publishes its intent before it acts, which makes supervision a read rather than an interruption.',
			'Confidence, provenance and the option to take over are part of the same surface, so intervening is a normal action rather than an emergency one.'
		],
		outcome: [
			'Supervision became a scan instead of a vigil.',
			'Interventions happen earlier, when they are cheap, because the interface shows intent rather than only outcome.'
		],
		metrics: [
			{ value: '1,100+', label: 'concurrent processes under one operator view' },
			{ value: '4.5x', label: 'earlier intervention on diverging runs' },
			{ value: '100%', label: 'of autonomous actions with recorded provenance' }
		],
		services: [
			'Product Strategy',
			'UX Architecture',
			'AI Systems',
			'Real-Time Engineering',
			'Design System'
		]
	}
]);

export function caseStudyBySlug(slug: string): CaseStudy | undefined {
	return CASE_STUDIES.find((study) => study.slug === slug);
}
