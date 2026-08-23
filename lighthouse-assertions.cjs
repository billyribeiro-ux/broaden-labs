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
 * The homepage. Everything in `prerendered` still applies except the two
 * main-thread-timing assertions, which report instead of blocking.
 *
 * It is the heaviest route by construction — the only one carrying the WebGL
 * hero, 322 KiB of three.js — and it is also the only route whose Lighthouse
 * timing on a shared CI runner is too unstable to gate on. The evidence and the
 * reasoning are on the two assertions below.
 */
const homepage = {
	...prerendered,

	/**
	 * `warn`, NOT `error`, and that is a correction of my own earlier number.
	 *
	 * I previously set an 0.80 floor and a 900ms ceiling here and called them
	 * "calibrated to CI hardware". They were calibrated on ONE run's values
	 * (0.67/0.84/0.84 and 713/308.5/310), and I described 713ms as the worst
	 * observed noise. With more samples that was simply wrong. Homepage
	 * total-blocking-time on GitHub's shared runners, on IDENTICAL code:
	 *
	 *   run 32653879167   1649ms   260ms    876ms     spread 1389ms
	 *   run 32655947010   1408ms  1090ms   1013ms     spread  395ms
	 *   run 32650957077    713ms   308ms    310ms     spread  405ms
	 *
	 * 260ms to 1649ms — a 6x range on the same page. The first of those runs
	 * PASSED the 900ms ceiling purely because lhci aggregates optimistically
	 * (best run wins) and one sample happened to land at 260ms. That is a
	 * coin toss wearing a gate's clothing.
	 *
	 * The performance SCORE inherits it, being heavily TBT-weighted: best-run
	 * scores of 85 and 68 across those same two runs.
	 *
	 * Raising the ceiling again would be the second time, and it would keep
	 * being wrong, because the problem is variance rather than level. So these
	 * two report and do not block.
	 *
	 * NOTHING IS ACTUALLY UNGUARDED BY THIS. The failure mode TBT was protecting
	 * against is a heavy module landing on the critical path, and
	 * `resource-summary:script:size` catches that deterministically at 400 KiB —
	 * its own note above says that ceiling "would have caught the two real
	 * regressions this project has had (three.js in the route node, GSAP in the
	 * layout)". Bytes do not fluctuate with runner contention. Also still hard
	 * errors on this route: accessibility, SEO and best-practices at 1.0, CLS at
	 * 0.01, and the 600 KiB total transfer budget.
	 *
	 * Worth noting what is NOT noisy in the same reports: LCP measured 3.19s,
	 * 3.19s, 3.20s, 3.19s, 3.19s, 3.19s across all six runs. The instability is
	 * specific to main-thread timing on a contended shared runner.
	 *
	 * Make these errors again once the homepage runs on hardware that gives a
	 * repeatable number, or once someone finds the cause of the 6x swing.
	 */
	'categories:performance': ['warn', { minScore: 0.85 }],
	// Same reasoning as the score above; see that comment for the measurements.
	'total-blocking-time': ['warn', { maxNumericValue: 900 }]
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
	/**
	 * EVERY matching entry applies, not just the first. So the patterns have to
	 * be mutually exclusive — adding a homepage entry without also excluding the
	 * homepage from the catch-all would leave both floors in force and the
	 * stricter one would still fail.
	 */
	assertMatrix: [
		{
			matchingUrlPattern: '.*/start-a-project$',
			assertions: dynamicRoute
		},
		{
			// The origin root and nothing below it: `http://host:port` or `.../`.
			matchingUrlPattern: '^https?://[^/]+/?$',
			assertions: homepage
		},
		{
			// Everything that is neither /start-a-project nor the origin root.
			matchingUrlPattern: '^(?!.*start-a-project)(?!https?://[^/]+/?$).*$',
			assertions: prerendered
		}
	]
};
