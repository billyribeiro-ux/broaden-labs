import { mdsvex } from 'mdsvex';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import { contentSafety } from './src/lib/build/content-safety-plugin.ts';

export default defineConfig({
	plugins: [
		contentSafety(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
				experimental: { async: true }
			},
			/**
			 * The runtime is PINNED, not inferred.
			 *
			 * Left unset, adapter-vercel@7's `resolve_runtime` falls through to
			 * `get_default_runtime()`, which reads `process.versions.node` of the
			 * BUILD container and throws "Unsupported Node.js version" for anything
			 * outside `[22, 24]`. That makes a successful deployment depend on the
			 * Node version selected in Vercel's project settings — a value that lives
			 * in a dashboard, is not in this repo, and defaults differently for older
			 * projects. Passing `runtime` explicitly skips that branch entirely: only
			 * the key itself is validated, so the build no longer cares what Node the
			 * container happens to run.
			 */
			adapter: adapter({ runtime: 'nodejs24.x' }),
			preprocess: [mdsvex({ extensions: ['.svx', '.md'] })],
			extensions: ['.svelte', '.svx', '.md'],
			/**
			 * `forkPreloads` is OFF, deliberately, despite the scaffold enabling it.
			 *
			 * It pre-applies a navigation's result inside Svelte's fork() so component
			 * work happens before the click lands. In 3.0.0-next.16 it produces a
			 * PARTIAL DOM update on client-side navigation in Firefox: on /insights,
			 * filtering by category correctly re-rendered the {#each} list down to one
			 * card while the sibling count text in the same component still read
			 * "6 notes". Isolated by flipping only this flag — off, the same
			 * navigation renders "1 note"; on, it does not. A hard reload of the same
			 * URL was always correct, which is what identified it as a client-side
			 * fork problem rather than a data one.
			 *
			 * The whole `experimental` namespace is documented as "Here be dragons.
			 * These are not subject to semantic versioning." A preloading optimisation
			 * is not worth a wrong number on screen. Worth revisiting on a later
			 * preview release.
			 */
			experimental: { remoteFunctions: true, forkPreloads: false },

			// Kit 3 emits CSP as a <meta> tag on prerendered pages and as a header
			// elsewhere. `mode: 'auto'` (the default) picks hashes for prerendered
			// pages and nonces for dynamic ones, which is exactly the split here.
			//
			// Keywords are written UNQUOTED — Kit quotes them itself. Writing
			// ["'self'"] emits `''self''`, which browsers reject, silently dropping
			// the entire directive.
			//
			// style-src carries unsafe-inline on purpose: Svelte transitions create
			// inline <style> elements at RUNTIME, which Kit cannot hash or nonce at
			// render time. Validate against `pnpm build && pnpm preview`, never
			// `pnpm dev` — dev strips hashes and injects unsafe-inline for HMR, so a
			// dev-validated policy proves nothing.
			//
			// frame-ancestors is NOT set here: it cannot be expressed in a <meta> tag
			// and is silently dropped on exactly the prerendered pages that make up
			// most of this site. It lives in vercel.json instead, as a real header.
			csp: {
				directives: {
					'default-src': ['self'],
					'script-src': ['self'],
					'style-src': ['self', 'unsafe-inline'],
					'img-src': ['self', 'data:', 'blob:'],
					'font-src': ['self'],
					'connect-src': ['self'],
					'object-src': ['none'],
					'base-uri': ['self'],
					'form-action': ['self']

					/**
					 * `upgrade-insecure-requests` is deliberately NOT set.
					 *
					 * It rewrites every http:// subresource to https://, INCLUDING on
					 * localhost. Chromium exempts localhost; WebKit does not — so with the
					 * directive on, every stylesheet, script and font on the preview
					 * server failed with "A TLS error caused the secure connection to
					 * fail", the page rendered completely unstyled, and 76 WebKit and
					 * mobile tests failed for a reason that had nothing to do with what
					 * they were testing.
					 *
					 * It also buys nothing here: the site has no absolute http:// URLs to
					 * upgrade — every asset is a same-origin relative path — and HSTS in
					 * vercel.json is what actually guarantees the transport. Keeping it
					 * would mean the CSP validated locally is not the CSP that ships,
					 * which is worse than the directive is good.
					 */
				}
			},

			// Kit 3 raised this default from 0 to one hour, so every open tab polls
			// version.json hourly. This site has no long-lived session worth
			// interrupting, and Kit still detects new deployments on data responses,
			// tab focus and visibility change without the timer.
			version: { pollInterval: 0 },

			/**
			 * `inlineStyleThreshold` is NOT set, and that is a reversal.
			 *
			 * Setting it to 8192 did what it promised — nine render-blocking
			 * stylesheets on the homepage became one, worth ~150-300ms of blocked
			 * render. But it also made Firefox throw, intermittently, on
			 * client-side navigation: "Unable to preload CSS for
			 * /_app/immutable/assets/Button.DOtvGb43.css". Kit inlines the rules
			 * into the document and leaves the <link> behind as a disabled
			 * `media="(max-width: 0)"` element for the client router, and Vite's
			 * preload helper still tries to fetch it.
			 *
			 * A stylesheet that sometimes fails to load on a real browser is not
			 * worth 200ms, and `shell.e2e.ts` asserts that no route logs a console
			 * error. The bulk of the performance win came from the two dynamic-import
			 * boundaries anyway: homepage 47 -> 91-99 with the CSS still split.
			 */

			// A broken internal link should fail the build, not become a 404 in
			// production. Brief §120: "No broken internal links."
			prerender: { handleHttpError: 'fail', handleMissingId: 'fail' }
		})
	],

	build: {
		// Kit 3 turns SSR sourcemaps ON by default. This is a public marketing site;
		// shipping readable server sources with it buys nothing.
		sourcemap: false,

		// Vite inlines assets under 4096 bytes as base64. A tightly subsetted .woff2
		// lands under that limit, which would kill separate caching, inflate it ~33%
		// and make it impossible to <link rel=preload>. Fonts are never inlined.
		assetsInlineLimit: (filePath: string) => (filePath.endsWith('.woff2') ? false : undefined)

		/**
		 * NOTE: `build.cssCodeSplit` is NOT set here. It is in SvelteKit's
		 * `enforced_config`, so Kit overwrites any value and prints "The following
		 * Vite config options will be overridden by SvelteKit". The equivalent
		 * outcome is reached through `kit.inlineStyleThreshold` above instead.
		 */
	},

	test: {
		expect: {
			requireAssertions: true,
			// The default 1000ms is short for a page that mounts a WebGL canvas or
			// waits on webfonts to settle.
			poll: { timeout: 5000 }
		},
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			},

			{
				extends: './vite.config.ts',
				resolve: {
					alias: {
						// `$app/env/private` is generated by svelte-kit sync and only
						// resolves inside the Kit build. Aliasing it lets the integration
						// tests import the REAL repository and run it against the real
						// database, instead of re-implementing the queries in the test and
						// verifying a copy.
						'$app/env/private': new URL(
							'./src/lib/server/testing/env-private-stub.ts',
							import.meta.url
						).pathname
					}
				},
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
