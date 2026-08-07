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
			adapter: adapter(),
			preprocess: [mdsvex({ extensions: ['.svx', '.md'] })],
			extensions: ['.svelte', '.svx', '.md'],
			experimental: { remoteFunctions: true, forkPreloads: true },

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
					'form-action': ['self'],
					'upgrade-insecure-requests': true
				}
			},

			// Kit 3 raised this default from 0 to one hour, so every open tab polls
			// version.json hourly. This site has no long-lived session worth
			// interrupting, and Kit still detects new deployments on data responses,
			// tab focus and visibility change without the timer.
			version: { pollInterval: 0 },

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
