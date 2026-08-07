import { form } from '$app/server';
import { getRequestEvent } from '$app/server';
import { DATABASE_URL } from '$app/env/private';
import { inquirySchema, newsletterSchema } from '#lib/schemas/inquiry';
import { submitInquiry, subscribe, recordEvent } from '#lib/server/db/repositories/inquiries';
import { hashClientAddress } from '#lib/server/security/hash';
import { logger } from '#lib/server/observability/logger';

/**
 * The inquiry workflow. Brief §58, §59, §90, §116.
 *
 * `form()` and not `command()`, deliberately: a remote form posts to the current
 * page URL and is progressively enhanced by an attachment when JavaScript
 * loads, so it works with scripting disabled. `command()` has no element, no
 * action, and therefore no no-JS story at all — and §116 requires one.
 *
 * This file lives beside its route rather than under src/lib/server/, because
 * Kit 3 treats any `/server/` path segment as server-only project-wide and
 * rejects remote modules there. It imports the server-only db module instead.
 *
 * The valibot schema is passed straight in: Kit accepts any Standard Schema by
 * duck-typing `'~standard' in validator`, and valibot 1.x implements it, so no
 * adapter is involved.
 */

/**
 * Derived from a value that is stable per environment. See hash.ts.
 *
 * `DATABASE_URL` is optional at build time (src/env.ts) so the marketing site
 * can deploy before a database exists. Asserting it non-null here would hash
 * every address with `undefined` in that configuration — silently, and
 * consistently enough that nothing would ever look wrong. Both handlers below
 * refuse to run instead; neither can do its job without a database anyway.
 */
const IP_SALT = DATABASE_URL;

/** Logged once per rejected submission so a misconfigured deploy is visible. */
function unconfigured(requestId: string, event: 'inquiry' | 'newsletter'): void {
	logger.error('Rejected: DATABASE_URL is not configured', { requestId, event, outcome: 'error' });
}

export type InquiryResult =
	| { readonly status: 'success'; readonly reference: string }
	| { readonly status: 'duplicate' }
	| { readonly status: 'throttled' }
	| { readonly status: 'error' };

export const submitProjectInquiry = form(inquirySchema, async (data): Promise<InquiryResult> => {
	const event = getRequestEvent();
	const requestId = event.locals.requestId;

	if (!IP_SALT) {
		unconfigured(requestId, 'inquiry');
		return { status: 'error' };
	}
	const ipHash = hashClientAddress(event.getClientAddress(), IP_SALT);

	const fillDurationMs = Number.parseInt(data.elapsedMs, 10);
	const elapsed = Number.isFinite(fillDurationMs) ? fillDurationMs : undefined;

	/**
	 * Honeypot: a field positioned off-screen and hidden from assistive tech, so
	 * no human ever fills it. Any content means a bot filled the form blind.
	 *
	 * The response is a plain success. Telling a bot it was detected is free
	 * information for whoever is tuning it; the submission is simply discarded.
	 */
	if (data.website2.trim() !== '') {
		await recordEvent({ kind: 'inquiry_rejected_honeypot', ipHash, requestId });
		logger.warn('Inquiry rejected', {
			requestId,
			event: 'inquiry',
			outcome: 'honeypot',
			ipHash
		});
		return { status: 'success', reference: 'accepted' };
	}

	try {
		const outcome = await submitInquiry(
			{
				firstName: data.firstName,
				lastName: data.lastName,
				email: data.email,
				company: data.company || null,
				website: data.website || null,
				projectType: data.projectType,
				estimatedBudget: data.estimatedBudget,
				timeline: data.timeline,
				message: data.message,
				referralSource: data.referralSource || null,
				signalSummary: data.signalSummary || null,
				consent: data.consent === true
			},
			{ ipHash, requestId, fillDurationMs: elapsed }
		);

		if (outcome.kind === 'throttled') {
			logger.warn('Inquiry rejected', {
				requestId,
				event: 'inquiry',
				outcome: 'throttled',
				ipHash
			});
			return { status: 'throttled' };
		}

		if (outcome.kind === 'duplicate') {
			logger.info('Inquiry rejected', {
				requestId,
				event: 'inquiry',
				outcome: 'duplicate',
				ipHash
			});
			return { status: 'duplicate' };
		}

		// The id is logged; the message body, the email and the name are not.
		logger.info('Inquiry accepted', {
			requestId,
			event: 'inquiry',
			outcome: 'created',
			inquiryId: outcome.inquiry.id,
			ipHash,
			fillDurationMs: elapsed
		});

		// A short, non-sequential reference the visitor can quote back. Derived
		// from the UUID rather than a counter, so it reveals no volume.
		return { status: 'success', reference: outcome.inquiry.id.slice(0, 8).toUpperCase() };
	} catch (error) {
		/**
		 * The exception is logged in full server-side and NOTHING about it crosses
		 * the wire — brief §59, "do not expose internal database errors". The
		 * visitor gets a state they can act on; the correlation id ties their
		 * report to this log line.
		 */
		logger.error('Inquiry failed', {
			requestId,
			event: 'inquiry',
			outcome: 'error',
			ipHash,
			errorName: error instanceof Error ? error.name : 'unknown'
		});
		return { status: 'error' };
	}
});

export type NewsletterResult = { readonly status: 'success' } | { readonly status: 'error' };

export const subscribeToNewsletter = form(
	newsletterSchema,
	async (data): Promise<NewsletterResult> => {
		const event = getRequestEvent();
		const requestId = event.locals.requestId;

		if (!IP_SALT) {
			unconfigured(requestId, 'newsletter');
			return { status: 'error' };
		}
		const ipHash = hashClientAddress(event.getClientAddress(), IP_SALT);

		if (data.website2.trim() !== '') {
			return { status: 'success' };
		}

		try {
			await subscribe(data.email);
			await recordEvent({ kind: 'newsletter_subscribed', ipHash, requestId });
			logger.info('Newsletter subscribed', {
				requestId,
				event: 'newsletter',
				outcome: 'created',
				ipHash
			});
			return { status: 'success' };
		} catch (error) {
			logger.error('Newsletter failed', {
				requestId,
				event: 'newsletter',
				outcome: 'error',
				ipHash,
				errorName: error instanceof Error ? error.name : 'unknown'
			});
			return { status: 'error' };
		}
	}
);
