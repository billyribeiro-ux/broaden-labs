import type { Handle, HandleServerError } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import { logger } from '#lib/server/observability/logger';

/**
 * Server hooks. Brief §64, §90, §92.
 */

export const handle: Handle = async ({ event, resolve }) => {
	// One id per request, attached to locals so every log line from this request
	// can be correlated, and surfaced to the visitor only on an error page.
	event.locals.requestId = randomUUID();

	const started = performance.now();
	const response = await resolve(event);
	const durationMs = Math.round(performance.now() - started);

	// Successful asset requests are noise. Only routes and failures are logged.
	const isAsset = event.url.pathname.startsWith('/_app/');
	if (!isAsset && (response.status >= 400 || durationMs > 500)) {
		logger.info('Request', {
			requestId: event.locals.requestId,
			route: event.route.id ?? event.url.pathname,
			outcome: String(response.status),
			durationMs
		});
	}

	return response;
};

/**
 * Kit 3 reduces unexpected errors to `{ status, message }` before they reach the
 * client, and this hook decides what `message` says. It returns a deliberately
 * generic string plus a correlation id — the stack, the exception message and
 * anything derived from them stay on the server.
 *
 * In Kit 3 `handleError` may also influence the status code; the default of 500
 * is correct for an unexpected error, so it is left alone.
 */
export const handleError: HandleServerError = ({ error, event, status, message }) => {
	const errorId = randomUUID();

	// 404s are not incidents and must not be logged as errors — Kit routes them
	// through here too, and treating them as failures would bury the real ones.
	if (status === 404) {
		return { message: 'That page does not exist.', code: 'not_found' };
	}

	logger.error('Unhandled error', {
		requestId: event.locals.requestId,
		route: event.route.id ?? event.url.pathname,
		errorId,
		errorName: error instanceof Error ? error.name : 'unknown',
		// The message is logged, never returned.
		outcome: message
	});

	return {
		message: 'Something broke on our side. The problem has been recorded.',
		code: 'internal',
		errorId
	};
};
