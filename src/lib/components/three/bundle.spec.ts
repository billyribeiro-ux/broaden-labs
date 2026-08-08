import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';

/**
 * three.js must stay OUT of the homepage's initial payload.
 *
 * This asserts on the BUILT OUTPUT, not on source, because the bug it exists to
 * catch is invisible in source. WebGLStage used to gate <Canvas> behind an
 * `{#if}` and carry a comment claiming the import was dynamic — while importing
 * `@threlte/core` and `three` at the top of the module. `{#if}` gates rendering;
 * only a dynamic `import()` gates bundling. Rollup put the entire three.js graph
 * into `nodes/2`, and every mobile visitor downloaded 192 KiB of it, including
 * the `fallback` tier that never renders a canvas at all.
 *
 * Nothing in the type system, the linter or `svelte-check` can see that. The
 * only evidence is the emitted chunk, so that is what is read here.
 *
 * Skipped rather than failed when there is no build: `pnpm test:unit` runs on a
 * clean checkout in CI before anything is compiled, and a test that demands a
 * build artifact it did not create would be reporting on its own environment.
 * The CI workflow runs this again after `pnpm build`, where it is not skipped.
 */

const CLIENT_OUT = '.svelte-kit/output/client/_app/immutable';

/** Type names that only exist if three.js itself was bundled into a file. */
const THREE_MARKERS = ['WebGLRenderer', 'InstancedMesh', 'ShaderMaterial', 'BufferGeometry'];

function chunkFiles(dir: string): string[] {
	const full = path.join(CLIENT_OUT, dir);
	if (!existsSync(full)) return [];
	return readdirSync(full)
		.filter((f) => f.endsWith('.js'))
		.map((f) => path.join(full, f));
}

function containsThree(file: string): boolean {
	const source = readFileSync(file, 'utf8');
	// Two markers, not one: `BufferGeometry` alone could plausibly appear in our
	// own comments or a variable name, but four three.js class names together
	// only occur when the library is present.
	return THREE_MARKERS.filter((marker) => source.includes(marker)).length >= 2;
}

/**
 * GSAP markers. `_gsap` is the property GSAP stamps onto every element it
 * touches and appears throughout the library; `ScrollTrigger` and `SplitText`
 * are the two plugins. Same two-marker rule as three.js above.
 */
const GSAP_MARKERS = ['ScrollTrigger', 'SplitText', '_gsap'];

function containsGsap(file: string): boolean {
	const source = readFileSync(file, 'utf8');
	return GSAP_MARKERS.filter((marker) => source.includes(marker)).length >= 2;
}

describe('animation bundle boundary', () => {
	const built = existsSync(CLIENT_OUT);

	/**
	 * GSAP must not be in the ROOT LAYOUT chunk (`nodes/0`).
	 *
	 * `+layout.svelte` imported `usePageTransitions`, which imported `gsap.ts`,
	 * so 122 KB of animation library was downloaded by every visitor to every
	 * route — including /privacy and /start-a-project, which run no animation at
	 * all — to power a transition that cannot run until the visitor navigates.
	 */
	it.skipIf(!built)('gsap is not in the root layout chunk', () => {
		const layout = chunkFiles('nodes').filter((f) => /\/0\./.test(f));
		expect(layout.length, 'expected to find the root layout node chunk').toBeGreaterThan(0);
		expect(layout.filter(containsGsap).map((f) => path.basename(f))).toEqual([]);
	});

	it.skipIf(!built)('gsap is not in any route node', () => {
		expect(
			chunkFiles('nodes')
				.filter(containsGsap)
				.map((f) => path.basename(f)),
			'gsap leaked into a route node — a component imported #lib/animation/motion ' +
				'statically instead of through lazyAttach().'
		).toEqual([]);
	});
});

describe('WebGL bundle boundary', () => {
	const built = existsSync(CLIENT_OUT);

	it.skipIf(!built)('three.js is not in any route node', () => {
		const offenders = chunkFiles('nodes').filter(containsThree);

		expect(
			offenders.map((f) => path.basename(f)),
			'three.js leaked into a route node — something imported it statically. ' +
				'Only ApertureScene.svelte may import three or @threlte/core, and only ' +
				'WebGLStage.svelte may reference it, through import().'
		).toEqual([]);
	});

	it.skipIf(!built)('three.js IS present in exactly one lazily-loaded chunk', () => {
		// The complement of the assertion above. Without this, deleting the scene
		// entirely would also make the first test pass.
		const carriers = chunkFiles('chunks').filter(containsThree);

		expect(
			carriers.length,
			'expected exactly one chunk to carry three.js; found ' + carriers.length
		).toBe(1);
	});
});
