// Both types live in the `/hooks` subpath, not the package root: as of
// @sveltejs/kit@3.0.0-next.25 they are declared inside `declare module
// '@sveltejs/kit/hooks'` (types/index.d.ts lines 1179 and 1233) and the root
// module no longer re-exports them.
import type { Handle, HandleServerError } from '@sveltejs/kit/hooks';
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
 *
 * As of @sveltejs/kit@3.0.0-next.25 the hook no longer receives `status` and
 * `message` as arguments. It receives a `kind`-discriminated `CaughtError`
 * (types/index.d.ts:1203) where the status and message live ON the caught error
 * for the `app`, `framework` and `validation` kinds. The `unknown` kind is typed
 * `unknown` precisely because it has no shape — Kit defaults it to 500 /
 * 'Internal Error', which is what is reconstructed below.
 */
export const handleError: HandleServerError = ({ kind, error, event }) => {
	const errorId = randomUUID();

	const status = kind === 'unknown' ? 500 : error.status;
	const message = kind === 'unknown' ? 'Internal Error' : error.message;

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
