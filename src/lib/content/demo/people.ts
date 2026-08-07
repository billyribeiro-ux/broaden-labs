import { registerContent } from '../safety.ts';
import type { Testimonial, TeamMember } from '../schema.ts';

/**
 * FICTIONAL testimonials and team profiles. Brief §54, §55.
 *
 * Nobody named here exists and no client said any of this. Every record is
 * registered with the content-safety gate, which blocks a production build
 * while they remain.
 *
 * Portraits are generated CSS/SVG compositions rather than photographs — brief
 * §54 and §108 both forbid stock imagery, and a stolen photograph of a real
 * person attached to an invented quote would be considerably worse than an
 * invented quote alone.
 */

export const TESTIMONIALS: readonly Testimonial[] = registerContent([
	{
		isDemo: true,
		kind: 'testimonial',
		id: 'testimonial-maya-brooks',
		quote:
			'Broaden didn’t just make the product easier to use. They changed the way we thought about the system underneath it.',
		author: 'Maya Brooks',
		role: 'COO',
		company: 'Meridian Markets'
	},
	{
		isDemo: true,
		kind: 'testimonial',
		id: 'testimonial-daniel-park',
		quote:
			'They had the rare ability to move from a workflow conversation to architecture to interface detail without losing the thread.',
		author: 'Daniel Park',
		role: 'VP Product',
		company: 'Northstar Health'
	},
	{
		isDemo: true,
		kind: 'testimonial',
		id: 'testimonial-elena-rossi',
		quote: 'The result felt simpler than what we started with—and did substantially more.',
		author: 'Elena Rossi',
		role: 'CEO',
		company: 'Vale Commerce'
	}
]);

export const TEAM: readonly TeamMember[] = registerContent([
	{
		isDemo: true,
		kind: 'teamMember',
		id: 'team-adrian-vale',
		name: 'Adrian Vale',
		role: 'Founder / Product Engineering',
		bio: 'Adrian works at the point where a product decision becomes an architectural one. He started Broaden after a decade of watching good ideas get diluted in the handoff between the people who imagined them and the people who had to build them.',
		expertise: ['Product architecture', 'Domain modelling', 'Technical strategy']
	},
	{
		isDemo: true,
		kind: 'teamMember',
		id: 'team-maya-chen',
		name: 'Maya Chen',
		role: 'Design Director',
		bio: 'Maya designs the states nobody asks for — the empty one, the failed one, the one with four hundred rows. She is unusually interested in data density, and unusually stubborn about the moment an interface stops explaining itself.',
		expertise: ['Interaction design', 'Design systems', 'Information architecture']
	},
	{
		isDemo: true,
		kind: 'teamMember',
		id: 'team-elias-morgan',
		name: 'Elias Morgan',
		role: 'Principal Engineer',
		bio: 'Elias builds systems for the day they are under load and something has already gone wrong. Most of his work concerns distributed state, and most of his opinions concern what should happen when a connection drops.',
		expertise: ['Distributed systems', 'Real-time architecture', 'Performance']
	},
	{
		isDemo: true,
		kind: 'teamMember',
		id: 'team-sofia-reyes',
		name: 'Sofia Reyes',
		role: 'Product Strategy',
		bio: 'Sofia’s first question is rarely about the product. It is usually about the business model underneath it, because that is where most feature disagreements actually originate. She turns ambiguity into decisions teams can act on.',
		expertise: ['Product discovery', 'Business modelling', 'Roadmap definition']
	}
]);
