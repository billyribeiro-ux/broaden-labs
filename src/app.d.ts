// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {
		/**
		 * Kit 3 changed `App.Error` from `{ message }` to `{ status, message }`. The
		 * base already declares both, so only our additions are listed here.
		 *
		 * `code` is a stable, machine-readable classification that is safe to show a
		 * visitor. `errorId` correlates what the visitor sees with the server log
		 * line; the underlying exception, its message and its stack never cross the
		 * wire. Brief §64, §90.
		 */
		interface Error {
			code: 'not_found' | 'bad_request' | 'rate_limited' | 'internal';
			errorId?: string;
		}

		interface Locals {
			/** Correlates every log line emitted while handling one request. */
			requestId: string;
		}

		interface PageState {
			/** Set when a case study is opened as an overlay via shallow routing. */
			caseStudy?: string;
		}
	}
}

export {};
