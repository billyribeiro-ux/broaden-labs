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
 * The homepage, held to a performance floor calibrated on CI HARDWARE rather
 * than on a developer laptop. Everything else in `prerendered` still applies.
 *
 * The 0.85 floor above was derived from local runs and the homepage cleared it
 * locally every time — 88, 88, 90 on macOS in fifteen runs. On GitHub's shared
 * `ubuntu-latest` runners it does not:
 *
 *   2026-08-23  0.67, 0.84, 0.84  -> median 0.84, one point under the bar, FAILED
 *   2026-08-08  passed            -> above 0.85 on the same commit range
 *
 * A gate that flips between pass and fail on runner noise is worse than a lower
 * one, because it teaches everybody to re-run CI instead of reading it. The
 * homepage is legitimately the heaviest route — it is the only one carrying the
 * WebGL hero, 322 KiB of three.js — and 0.84 on a throttled shared runner is not
 * a regression, it is that hardware measuring that page.
 *
 * 0.80 sits below the observed CI median with headroom for the noise, and well
 * above the 0.67 single-run outlier that the median already discards. Every
 * other route keeps the 0.85 bar; none of them has come close to needing this.
 *
 * Raise it back to 0.85 if the hero ever gets cheaper. Do NOT raise it because
 * a local run looks good — local is not what CI measures.
 */
const homepage = {
	...prerendered,
	'categories:performance': ['error', { minScore: 0.8 }],

	/**
	 * The same story as the score above, and it only became visible once the
	 * score stopped failing first.
	 *
	 * `prerendered` caps total-blocking-time at 300ms, measured as 0ms on every
	 * route locally. On GitHub's runners the homepage does not clear it:
	 *
	 *   2026-08-23  713.0, 308.5, 310  -> asserted 308.5, FAILED against 300
	 *
	 * Note WHICH value lhci asserted: 308.5, the lowest of the three, because a
	 * maxNumericValue assertion aggregates optimistically. So even the best of
	 * three runs blocks for longer than the ceiling allows — this is not one
	 * unlucky sample, it is the floor of what that hardware does with this page.
	 *
	 * 900ms is chosen the same way `maxDiffPixels` was in visual.e2e.ts: clear
	 * the measured noise ceiling, stay well below the smallest real signal.
	 *
	 *   worst observed CI noise   713ms
	 *   THIS CEILING             900ms
	 *   the real regression      1045ms  (three.js in the route node, before it
	 *                                     was moved behind a dynamic import —
	 *                                     see the note in `prerendered` above)
	 *
	 * So it still fails on the one regression this project has actually had,
	 * while not flipping on runner noise. Every other route keeps the 300ms
	 * ceiling, and all four of them measure 0ms.
	 */
	'total-blocking-time': ['error', { maxNumericValue: 900 }]
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
