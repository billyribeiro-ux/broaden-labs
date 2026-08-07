import type { Insight } from './schema.ts';

/**
 * Insight articles. Brief §56, §57.
 *
 * Authored, not credential content: this is Broaden writing about engineering,
 * not a claim about a client, so it carries no isDemo flag and is not gated.
 *
 * Structured as typed blocks rather than markdown strings. The brief requires
 * inline callouts, code styling, figures and tables, and a discriminated union
 * makes each of those a real component with real semantics — a markdown blob
 * would have to be parsed and would lose the table caption and the callout role.
 *
 * §57 is explicit: "Do not fill the article with lorem ipsum." These are written
 * out.
 */
export const INSIGHTS: readonly Insight[] = [
	{
		slug: 'architecture-decisions-your-users-eventually-feel',
		title: 'Architecture decisions your users eventually feel',
		category: 'Architecture',
		author: 'Elias Morgan',
		published: '2026-06-18',
		readingMinutes: 7,
		dek: 'Database boundaries and caching strategy sound like implementation details until they become loading states and support tickets.',
		excerpt:
			'Database boundaries, caching strategy, permissions, asynchronous work, and failure recovery sound like implementation details—until they become loading states, blocked actions, stale screens, and support tickets. Then they are product decisions.',
		related: [
			'real-time-ux-is-a-state-management-problem',
			'when-not-to-rewrite-a-legacy-application'
		],
		body: [
			{
				type: 'p',
				text: 'There is a familiar moment in a product review where someone asks why a screen takes two seconds to appear, and the answer involves the word "join". The room usually treats this as a technical detail to be resolved offline. It is not a technical detail. It is the product, arriving late.'
			},
			{
				type: 'p',
				text: 'Every architectural decision has a user-visible consequence, and the gap between making the decision and feeling the consequence is usually measured in months. That delay is what makes these decisions so easy to make badly.'
			},
			{ type: 'h2', text: 'Where the boundary falls decides what can be fast' },
			{
				type: 'p',
				text: 'A service boundary is a promise that two things can evolve independently. It is also a guarantee that they can no longer be queried together cheaply. Draw the boundary between "order" and "customer" and you have decided, permanently, that any screen showing both will make two calls, handle two failure modes, and have an intermediate state where one arrived and the other did not.'
			},
			{
				type: 'callout',
				text: 'A boundary is not just an organisational choice. It is a latency floor and a set of loading states you have committed to designing.'
			},
			{
				type: 'p',
				text: 'This is worth stating plainly during design, not discovering during implementation. The question "what will this screen need to show together?" belongs in the same conversation as "what should own this data?" — and it is usually asked six weeks later.'
			},
			{ type: 'h2', text: 'Caching is a decision about staleness, not speed' },
			{
				type: 'p',
				text: 'Teams add caching to make something faster and inherit a question they did not intend to answer: how wrong is this allowed to be, and for how long? That question has a correct answer per surface, and it is a product answer.'
			},
			{
				type: 'table',
				caption: 'The same cache TTL means something different on each surface',
				head: ['Surface', 'Tolerable staleness', 'What the user does about it'],
				rows: [
					['Marketing page', 'Hours', 'Nothing — they never know'],
					['Dashboard summary', 'Seconds to a minute', 'Refreshes, and trusts it less next time'],
					['Account balance', 'None', 'Makes a decision on a wrong number'],
					['Permissions', 'None', 'Sees something they should not']
				]
			},
			{
				type: 'p',
				text: 'A single global TTL applies the marketing page’s tolerance to the balance. Nobody decides that; it is what happens when caching is treated as an infrastructure concern.'
			},
			{ type: 'h2', text: 'Asynchronous work is a UI contract' },
			{
				type: 'p',
				text: 'The moment a request is handed to a queue, the interface acquires a new obligation: to represent something that is neither done nor failed. Most products discover this obligation after shipping, which is why so many have a button that appears to do nothing.'
			},
			{
				type: 'code',
				language: 'ts',
				code: `// The queue call is the easy half.\nawait jobs.enqueue({ type: 'export', accountId });\n\n// This is the part that decides whether the product feels broken:\n//  - what does the button say for the next 40 seconds?\n//  - what does a second click do?\n//  - what happens if they navigate away and come back?\n//  - how do they find out it failed, if they are no longer here?`
			},
			{
				type: 'p',
				text: 'None of those four questions has a backend answer. All four are determined by a backend decision.'
			},
			{ type: 'h2', text: 'The practical version' },
			{
				type: 'list',
				items: [
					'Ask what each screen must show together before deciding what owns the data.',
					'Set staleness tolerance per surface, and treat a global TTL as a smell.',
					'Design the pending and failed state at the same time you decide something is asynchronous.',
					'Write down which decisions are reversible. Those are the ones you can defer.'
				]
			},
			{
				type: 'p',
				text: 'None of this makes architecture a design activity. It makes it a shared one — which is the only version that produces software people describe as feeling well made.'
			}
		]
	},

	{
		slug: 'real-time-ux-is-a-state-management-problem',
		title: `Real-time UX is a state-management problem before it's a networking problem`,
		category: 'Real-Time',
		author: 'Elias Morgan',
		published: '2026-05-27',
		readingMinutes: 8,
		dek: 'Opening the socket takes an afternoon. Deciding what the screen means when messages arrive out of order takes the rest of the project.',
		excerpt:
			'Opening a WebSocket is an afternoon of work. Deciding what the interface should mean when a message arrives late, twice, or out of order is the rest of the project — and it is a state-modelling problem, not a transport one.',
		related: [
			'architecture-decisions-your-users-eventually-feel',
			'ai-features-need-failure-design'
		],
		body: [
			{
				type: 'p',
				text: 'Every real-time project has a week where the socket connects, messages appear in the console, and the team believes the hard part is behind them. It is not. Transport was the part with documentation.'
			},
			{ type: 'h2', text: 'The four questions transport does not answer' },
			{
				type: 'list',
				items: [
					'What is authoritative — the last message received, or the last write this client made?',
					'What does the interface show while those two disagree?',
					'What happens to the optimistic update when the server rejects it?',
					'After a reconnect, is the client resuming or starting over?'
				]
			},
			{
				type: 'p',
				text: 'A product can be built with no explicit answer to any of these. It will work in development, where the network is a function call, and it will fail on a train.'
			},
			{ type: 'h2', text: 'Ordering is not guaranteed and users notice' },
			{
				type: 'p',
				text: 'Two updates to the same record, sent 40ms apart, can arrive in either order. If the interface renders whichever arrived last, the record will occasionally show the older value and stay that way until something else forces a redraw.'
			},
			{
				type: 'callout',
				text: 'If a message does not carry a version, the client cannot tell "new" from "late". Most flickering real-time UIs are this bug.'
			},
			{
				type: 'code',
				language: 'ts',
				code: `// Not: apply whatever arrived.\n// Instead: apply only what is newer than what we already have.\nfunction receive(update: Update, current: Record) {\n  if (update.version <= current.version) return current; // late duplicate\n  return { ...current, ...update.fields, version: update.version };\n}`
			},
			{
				type: 'p',
				text: 'Four lines. They are not clever, and they are the difference between an interface people trust and one they refresh out of habit.'
			},
			{ type: 'h2', text: 'Reconnection is a product decision' },
			{
				type: 'p',
				text: 'When a connection drops for eleven seconds, something happened that the client missed. There are exactly three honest options: replay the gap, refetch the world, or tell the user their view is stale. Choosing silently — which is what happens when nobody chooses — means picking the third and not telling them.'
			},
			{
				type: 'table',
				caption: 'Reconnection strategies and what they cost',
				head: ['Strategy', 'Server cost', 'Correct when'],
				rows: [
					['Replay from cursor', 'Retained event log', 'Order matters and history is bounded'],
					['Refetch snapshot', 'One expensive read', 'State is small and latest-wins'],
					['Mark as stale', 'None', 'The user must decide whether to trust it']
				]
			},
			{
				type: 'p',
				text: 'All three are defensible. Only one of them is defensible by accident, and it is the one that makes the product feel unreliable.'
			},
			{ type: 'h2', text: 'Design the disagreement' },
			{
				type: 'p',
				text: 'The interesting states in a real-time product are the ones where the client and the server disagree: pending, superseded, rejected, stale, reconnecting. Those five states are the actual design work. The socket is plumbing.'
			}
		]
	},

	{
		slug: 'your-design-system-is-missing-the-states-that-matter',
		title: 'Your design system is missing the states that matter',
		category: 'Design',
		author: 'Maya Chen',
		published: '2026-05-06',
		readingMinutes: 6,
		dek: 'Most systems document the button. Very few document the button at 3am with a failed request behind it.',
		excerpt:
			'Most design systems document default, hover and disabled — and then leave loading, error, empty, partial and stale to be improvised per feature by whoever ships next. Those are the states users actually spend time in.',
		related: ['the-cost-of-making-every-feature-a-special-case', 'ai-features-need-failure-design'],
		body: [
			{
				type: 'p',
				text: 'Open almost any design system and the button page will show you six variants, three sizes and a hover state. Open the product it governs and you will find a button that has been disabled with no explanation, a table with a blank area where an empty state should be, and a form that reports failure by doing nothing.'
			},
			{
				type: 'p',
				text: 'The system is not wrong. It is incomplete in a specific and predictable way: it documents the states designers see in Figma, and omits the ones users see in production.'
			},
			{ type: 'h2', text: 'The nine states' },
			{
				type: 'list',
				items: [
					'Default — documented everywhere.',
					'Hover — documented everywhere, and irrelevant on touch.',
					'Focus-visible — often missing, and the one keyboard users depend on entirely.',
					'Active/pressed — usually a nice-to-have.',
					'Disabled — documented, but rarely with the reason it is disabled.',
					'Loading — improvised per feature.',
					'Error — improvised per feature, usually as a red border with no message.',
					'Empty — the most common state on day one of any product.',
					'Selected — inconsistently modelled, especially in filters.'
				]
			},
			{
				type: 'callout',
				text: 'A disabled control with no explanation is not a state. It is a dead end the user has to guess their way out of.'
			},
			{ type: 'h2', text: 'Empty is a first-run experience' },
			{
				type: 'p',
				text: 'Every list is empty before it is full, and every user meets that version first. Treating the empty state as an edge case means the product’s first impression is the one nobody designed.'
			},
			{
				type: 'p',
				text: 'An empty state has a job: say what would be here, and offer the action that puts something here. "No results" does neither.'
			},
			{ type: 'h2', text: 'Errors are content, not decoration' },
			{
				type: 'code',
				language: 'html',
				code: `<!-- The border says something is wrong. Nothing says what. -->\n<input class="error" />\n\n<!-- The state is announced, associated, and actionable. -->\n<input id="email" aria-invalid="true" aria-describedby="email-error" />\n<p id="email-error">Enter an email address we can reply to — this one is missing an @.</p>`
			},
			{
				type: 'p',
				text: 'The second version is not more work at the system level. It is less work at the feature level, because the association and the announcement are already decided.'
			},
			{ type: 'h2', text: 'The test' },
			{
				type: 'p',
				text: 'Take any component in your system and ask what it looks like when the request behind it has failed, when there is nothing to show, and when the user is holding a keyboard. If the answer is "that depends on the feature", you have a style guide.'
			}
		]
	},

	{
		slug: 'when-not-to-rewrite-a-legacy-application',
		title: 'When not to rewrite a legacy application',
		category: 'Engineering',
		author: 'Adrian Vale',
		published: '2026-04-14',
		readingMinutes: 7,
		dek: 'A rewrite is the most expensive available method for discovering what your current system actually does.',
		excerpt:
			'Old software is not automatically bad software. The question is never "is this legacy?" — it is "which specific constraint is costing us, and is a rewrite the cheapest way to remove it?" Usually it is not.',
		related: [
			'architecture-decisions-your-users-eventually-feel',
			'the-cost-of-making-every-feature-a-special-case'
		],
		body: [
			{
				type: 'p',
				text: 'The case for a rewrite is almost always made with adjectives. The system is old, brittle, unmaintainable, a mess. None of those are measurements, and none of them tell you what will be better afterwards.'
			},
			{
				type: 'p',
				text: 'The case against is usually made with one observation: the existing system encodes a decade of decisions that nobody wrote down, and a rewrite proposes to rediscover all of them under a deadline.'
			},
			{ type: 'h2', text: 'Name the constraint or do not start' },
			{
				type: 'list',
				items: [
					'A change that should take a day takes three weeks — where, specifically, does the time go?',
					'Releases are rare — is that the architecture, or the deployment process?',
					'Performance is degrading — is it the data model, the queries, or the volume?',
					'Nobody understands module X — is that a rewrite, or two weeks of reading and a document?'
				]
			},
			{
				type: 'callout',
				text: 'If the constraint cannot be named specifically enough to measure, a rewrite will not remove it — it will reproduce it in newer syntax.'
			},
			{ type: 'h2', text: 'The cases where a rewrite is genuinely right' },
			{
				type: 'p',
				text: 'There are real ones. The runtime is unsupported and unpatched. The data model contradicts the business the company now runs. The system cannot be deployed without downtime and that has become commercially unacceptable. In each of those, the constraint is structural and no amount of incremental work reaches it.'
			},
			{
				type: 'table',
				caption: 'What the symptom usually indicates',
				head: ['Symptom', 'Usually', 'Occasionally'],
				rows: [
					['Slow to change', 'Missing tests, unclear ownership', 'Genuine coupling'],
					['Slow at runtime', 'Query and index problems', 'Wrong data model'],
					['Frequent incidents', 'No observability', 'Fundamental fragility'],
					['Nobody wants to work on it', 'Tooling and onboarding', 'Language or runtime is dead']
				]
			},
			{ type: 'h2', text: 'The middle path is not a compromise' },
			{
				type: 'p',
				text: 'Routing new work through a new implementation while the old one keeps serving what it already serves is not half a rewrite. It is the version that can be stopped halfway and still leave the business better off — which is the only property that matters when the estimate turns out to be wrong.'
			}
		]
	},

	{
		slug: 'ai-features-need-failure-design',
		title: 'AI features need failure design',
		category: 'AI',
		author: 'Sofia Reyes',
		published: '2026-03-23',
		readingMinutes: 6,
		dek: 'A feature that is right 95% of the time is a feature that is wrong in front of a user roughly once a day.',
		excerpt:
			'Most AI features are designed around the case where the model is right. The remaining few percent are where the product is actually decided — and "it might be wrong" is not a design.',
		related: [
			'your-design-system-is-missing-the-states-that-matter',
			'real-time-ux-is-a-state-management-problem'
		],
		body: [
			{
				type: 'p',
				text: 'A model that is right 95% of the time sounds like a strong feature. On a surface used twenty times a day it is also a feature that is confidently wrong in front of a user every single day, and the user has no way to tell which time it was.'
			},
			{
				type: 'p',
				text: 'That asymmetry — high accuracy, no signal about which case you are in — is the actual design problem. It is not solved by a better prompt.'
			},
			{ type: 'h2', text: 'Show the workings, not the confidence score' },
			{
				type: 'p',
				text: 'A percentage next to an answer is not provenance. It is a number the user has no basis to calibrate against, and it tends to increase trust rather than inform it.'
			},
			{
				type: 'callout',
				text: 'Provenance beats confidence. "From page 4 of the March invoice" is checkable. "94% confident" is not.'
			},
			{ type: 'h2', text: 'Make review cheaper than redoing it' },
			{
				type: 'p',
				text: 'The value of an extraction feature is not the extraction. It is the time saved versus doing it manually. If verifying the output takes as long as producing it, the feature has moved work rather than removed it.'
			},
			{
				type: 'list',
				items: [
					'Put the source next to the answer, not one click away.',
					'Let a correction be one keystroke, and remember it.',
					'Make "I am not sure" a first-class output, not a low score.',
					'Never let an unreviewed answer silently become an input to something else.'
				]
			},
			{ type: 'h2', text: 'Design the refusal' },
			{
				type: 'p',
				text: 'Every AI feature needs a defined behaviour for the case where it should not answer: input out of scope, source missing, permission absent, confidence genuinely low. Products that skip this do not stop answering — they answer anyway, which is the failure mode with the highest cost and the lowest visibility.'
			},
			{
				type: 'p',
				text: 'The question to ask before building is not "how good is the model?" It is "what does this do on the day it is wrong, and who finds out?"'
			}
		]
	},

	{
		slug: 'the-cost-of-making-every-feature-a-special-case',
		title: 'The cost of making every feature a special case',
		category: 'Product',
		author: 'Adrian Vale',
		published: '2026-02-11',
		readingMinutes: 5,
		dek: 'Each exception is reasonable on the day it is added. The tenth one is why the product takes a quarter to change.',
		excerpt:
			'Every special case is defensible in isolation and the accumulation is what makes a codebase expensive. The cost is not the exception itself — it is that the next person cannot tell which rules still hold.',
		related: [
			'when-not-to-rewrite-a-legacy-application',
			'your-design-system-is-missing-the-states-that-matter'
		],
		body: [
			{
				type: 'p',
				text: 'A customer needs the export to include one extra column. It ships as a flag. Another needs the approval step skipped for internal accounts. Another needs a different tax rule for one region. Each request is small, each is legitimate, and each is implemented by the fastest available route.'
			},
			{
				type: 'p',
				text: 'Eighteen months later, changing the export means understanding four flags, and nobody can say with confidence which combinations are reachable.'
			},
			{ type: 'h2', text: 'The real cost is epistemic' },
			{
				type: 'p',
				text: 'The expensive part of a special case is not the branch. It is that it removes a rule someone could previously rely on. "Exports always include these columns" was knowledge. After the flag, it is a guess that has to be re-verified every time.'
			},
			{
				type: 'callout',
				text: 'A conditional does not just add a path. It deletes a fact.'
			},
			{ type: 'h2', text: 'The question that catches most of them' },
			{
				type: 'p',
				text: 'Before adding an exception, ask what would have to be true about the model for this not to be an exception. Usually the answer reveals a concept the domain has and the schema does not — "account type", "jurisdiction", "contract terms" — and naming that concept absorbs the current request and the next four.'
			},
			{
				type: 'code',
				language: 'ts',
				code: `// The special case, on the day it is reasonable:\nif (account.id === 'acme') columns.push('internal_ref');\n\n// The concept the special case was pointing at:\ncolumns.push(...account.exportProfile.columns);`
			},
			{
				type: 'p',
				text: 'The second version is barely more work on the day. It is dramatically less work on every subsequent day, and — more importantly — it restores a rule: exports include the columns the account’s export profile specifies. That sentence is true again, and can be relied on.'
			},
			{ type: 'h2', text: 'When the exception is correct' },
			{
				type: 'p',
				text: 'Sometimes there genuinely is no concept, and the honest thing is a documented exception with an expiry conversation attached. That is a fine outcome. It is a different outcome from an undocumented flag, which is what happens when nobody asks.'
			}
		]
	}
];

export function insightBySlug(slug: string): Insight | undefined {
	return INSIGHTS.find((insight) => insight.slug === slug);
}

export const INSIGHT_CATEGORIES = [
	'Engineering',
	'Product',
	'Design',
	'Real-Time',
	'AI',
	'Architecture'
] as const;
