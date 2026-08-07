import { error } from '@sveltejs/kit';
import { caseStudyBySlug, CASE_STUDIES } from '#lib/content/demo/case-studies';
import type { PageLoad } from './$types';

/**
 * Kit 3's `error()` takes the message as its SECOND argument. The Kit 2 shape —
 * `error(404, { message })` — is deprecated, and `App.Error` now requires
 * `status` as well as `message`, so the third argument carries our own fields.
 */
export const load: PageLoad = ({ params }) => {
	const study = caseStudyBySlug(params.slug);
	if (!study) {
		error(404, 'That case study does not exist.', { code: 'not_found' });
	}

	const index = CASE_STUDIES.findIndex((entry) => entry.slug === study.slug);
	// Wraps, so the last study leads back to the first rather than dead-ending.
	// The `?? study` is not defensive noise: under noUncheckedIndexedAccess the
	// index access is `CaseStudy | undefined`, and a self-link is the honest
	// fallback for a one-item list rather than a non-null assertion.
	const next = CASE_STUDIES[(index + 1) % CASE_STUDIES.length] ?? study;

	return { study, next };
};

/** Every slug is known at build time, so the whole route prerenders. */
export const prerender = true;

export function entries() {
	return CASE_STUDIES.map((study) => ({ slug: study.slug }));
}
