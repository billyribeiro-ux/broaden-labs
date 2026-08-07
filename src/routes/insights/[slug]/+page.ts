import { error } from '@sveltejs/kit';
import { insightBySlug, INSIGHTS } from '#lib/content/insights';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const insight = insightBySlug(params.slug);
	if (!insight) {
		error(404, 'That article does not exist.', { code: 'not_found' });
	}

	const related = insight.related
		.map((slug) => insightBySlug(slug))
		.filter((entry): entry is NonNullable<typeof entry> => entry !== undefined);

	return { insight, related };
};

export const prerender = true;

export function entries() {
	return INSIGHTS.map((insight) => ({ slug: insight.slug }));
}
