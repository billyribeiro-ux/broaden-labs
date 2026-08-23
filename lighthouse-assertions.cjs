/**
 * Lighthouse assertions.
 *
 * Every threshold below was set AFTER measuring, and the measured value is in
 * the comment beside it. None of them is a round number chosen because it looked
 * like a good target — a threshold invented before the measurement either passes
 * trivially and means nothing, or fails on day one and gets deleted.
 *
 * The measurements are mobile, throttled (Lighthouse's default: slow 4G, 4x CPU)
 * against a production build. See lighthouserc.cjs.
 *
 * Thresholds carry deliberate headroom because Lighthouse is noisy: the homepage
 * scored 99 and 91 on two consecutive single runs of identical code. CI runs
 * three times and asserts on the median run, but a floor pinned to the best
 * observed value would still fail on ordinary variance, and a flaky gate is one
 * nobody trusts.
 */

/** Applies everywhere. These are the ones with no excuse for regressing. */
const universal = {
	// Measured 100 on all five URLs, twice. This site is WCAG 2.2 AA by
	// construction and axe runs over every route in the E2E suite as well.
	'categories:accessibility': ['error', { minScore: 1 }],

	// Measured 100 on all five. docs/SEO.md is the reasoning behind every tag.
	'categories:seo': ['error', { minScore: 1 }],

	// Measured 100 on all five.
	'categories:best-practices': ['error', { minScore: 1 }],

	/**
	 * Measured 0.000 everywhere. shell.e2e.ts already asserts CLS is exactly zero
	 * at four viewports and under two throttling profiles; this is the same claim
	 * checked by a different instrument, which is worth having because the two
	 * disagreed once before — the E2E test passed on a fast connection while a
	 * real font-swap reflow was happening on a slow one.
	 */
	'cumulative-layout-shift': ['error', { maxNumericValue: 0.01 }],

	/**
	 * OFF, deliberately. `build.sourcemap` is false: this is a public marketing
	 * site and shipping readable sources buys nothing. The audit is diagnostic
	 * and does not affect any category score, but leaving it unasserted would
	 * mean a future reader could not tell whether it was considered.
	 */
	'valid-source-maps': 'off'
};

/**
 * The four prerendered routes. These are static files from a CDN, so there is
 * no server in the critical path and the bar is high.
 */
const prerendered = {
	...universal,

	// Measured 91, 94, 94, 95. Floored at 0.85 for the variance noted above.
	'categories:performance': ['error', { minScore: 0.85 }],

	// Measured 0ms on all four, after three.js and GSAP were moved behind
	// dynamic imports. Before that the homepage was 1045ms.
	'total-blocking-time': ['error', { maxNumericValue: 300 }],

	/**
	 * A JS budget, as §88 asks for. Measured transfer: 64 KiB on /work,
	 * 114 KiB on the detail templates, 322 KiB on the homepage — the homepage
	 * figure is three.js, which arrives AFTER first paint on a lazy chunk and is
	 * why its TBT is 0 despite the weight.
	 *
	 * 400 KiB is the ceiling that would have caught the two real regressions
	 * this project has had (three.js in the route node, GSAP in the layout)
	 * without failing on the intended lazy loading.
	 */
	'resource-summary:script:size': ['error', { maxNumericValue: 400 * 1024 }],

	// Measured 238-499 KiB. Fonts are a fixed 155 KiB of it on every route.
	'resource-summary:total:size': ['error', { maxNumericValue: 600 * 1024 }]
};

/**
 * `/start-a-project` is held to a LOWER performance bar than everything else,
 * and that is recorded here rather than hidden by simply not asserting it.
 *
 * Originally measured 68 and 69 against 91-95 for the prerendered routes, caused
 * by a single ~1.3s main-thread task that was NOT JavaScript execution — a V8
 * CPU profile attributed 1376ms to `(program)` and 23ms to script. It is the
 * only route that is not prerendered.
 *
 * IT NO LONGER REPRODUCES, and the floor is still 0.6 on purpose.
 *
 * Six clean `lhci autorun` runs on two dates now show this route at performance
 * 92 with total-blocking-time 0ms — identical to the prerendered routes:
 *
 *   2026-08-08   3 runs   perf 92, TBT 0ms
 *   2026-08-23   3 runs   perf 92, TBT 0ms
 *
 * (A seventh run showed 526ms on the HOMEPAGE, not this route. It was an
 * artifact of other work running concurrently against a 4x-CPU-throttled
 * measurement; a re-run on an idle machine gave 0ms across all fifteen runs.)
 *
 * The floor is NOT raised to match the others, because "stopped reproducing" is
 * not "understood". Two records disagree about the trigger — this comment
 * originally blamed a cold preview server, TODO.md later established that the
 * real variable was network throttling and the cold-server theory was wrong —
 * and lhci requests this route LAST, so a first-request-to-a-cold-server
 * condition would not be exercised here either way. Raising the bar on a cause
 * nobody has pinned down would convert an unexplained absence into a flaky gate.
 *
 * Revisit when the cause is actually identified. TODO.md carries the next
 * diagnostic step. Deleting the assertion would let the page get worse silently.
 */
const dynamicRoute = {
	...universal,
	'categories:performance': ['error', { minScore: 0.6 }],
	'total-blocking-time': ['warn', { maxNumericValue: 1600 }],
	'resource-summary:script:size': ['error', { maxNumericValue: 400 * 1024 }],
	'resource-summary:total:size': ['error', { maxNumericValue: 600 * 1024 }]
};

module.exports = {
	// `preset` is deliberately NOT set. lighthouse:recommended asserts dozens of
	// audits nobody has looked at, which produces a wall of warnings that trains
	// everyone to ignore the output. Everything asserted here was chosen.
	assertMatrix: [
		{
			matchingUrlPattern: '.*/start-a-project$',
			assertions: dynamicRoute
		},
		{
			// Everything that is not /start-a-project.
			matchingUrlPattern: '^(?!.*start-a-project).*$',
			assertions: prerendered
		}
	]
};
