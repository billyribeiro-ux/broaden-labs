import { error } from '@sveltejs/kit';
import { serviceBySlug, SERVICES } from '#lib/content/services';
import { CASE_STUDIES } from '#lib/content/demo/case-studies';
import { INSIGHTS } from '#lib/content/insights';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const service = serviceBySlug(params.slug);
	if (!service) {
		error(404, 'That service does not exist.', { code: 'not_found' });
	}

	// Relevant work is derived from the capability tags rather than hand-listed,
	// so adding a case study cannot leave a service page out of date.
	const related = CASE_STUDIES.filter((study) =>
		study.capabilities.some(
			(capability) => service.name.includes(capability) || capability === service.name
		)
	).slice(0, 2);

	const readings = INSIGHTS.slice(0, 2);
	const others = SERVICES.filter((entry) => entry.slug !== service.slug);

	return { service, related, readings, others };
};

export const prerender = true;

export function entries() {
	return SERVICES.map((service) => ({ slug: service.slug }));
}
