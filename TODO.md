# TODO

## Evidence gaps

### One transitive advisory has no published fix

**`extract-zip` — GHSA-jmr9-qjv8-65gv, `high`.** The advisory names `>=2.0.2` as
patched; `2.0.1` is the newest version ever published, so there is nothing to
upgrade to. Verified against the registry, not taken from the advisory text.

Reaches the tree only via
`@lhci/cli > lighthouse > puppeteer-core > @puppeteer/browsers`, where it unzips
the Chromium build Lighthouse downloads from Google's own endpoint. Not in the
application dependency graph; never reaches the built site.

Suppressed by exactly one `auditConfig.ignoreGhsas` entry in
`pnpm-workspace.yaml`, with the reasoning written beside it. **This is the only
suppression in the repository.**

**Context:** `pnpm audit --audit-level=high` exited 1 with **41 findings
(18 high, 1 critical)** on a clean HEAD checkout, before any of this work — the
failure was pre-existing, not introduced. Every other advisory, down to `low`,
is now fixed by version floors in `pnpm-workspace.yaml`. Both `pnpm audit` and
`pnpm audit --audit-level=high` exit 0, with **1 finding** remaining.

**Blocks:** nothing. Revisit if extract-zip ever ships 2.0.2.

### `layout-shift` is a Chromium-only API

**Not a gap so much as a correction, recorded so it is not "fixed" back.**
`PerformanceObserver.supportedEntryTypes` does not include `layout-shift` in
Firefox or WebKit — verified by launching all three engines and reading the
list. The CLS tests in `shell.e2e.ts` previously ran in the firefox, webkit and
mobile projects, where the observer recorded nothing, `total` stayed 0 and the
assertion passed without measuring anything. They are now Chromium-only and
skip honestly elsewhere.

### A real Vercel deployment

**Missing:** confirmation from an actual deploy.

**Looked in:** every failure mode was reproduced locally by clearing the
environment and setting `VERCEL_ENV` by hand, and the emitted `.vercel/output/`
was inspected directly — function runtime, `config.json` routes, and a cold boot
of the handler with no environment at all.

**Why:** deploying needs the owner's Vercel account and an outward-facing action
they have not asked for. Simulation is not the same as a deploy and is not
reported as one.

**Blocks:** nothing in the repository.

### Legal copy — two values need confirming, the documents are written

`/privacy`, `/terms` and `/accessibility` now carry real content, are indexable,
and are listed in the sitemap.

**One value still needs a human decision**, in `src/lib/content/legal.ts`:

1. `ENTITY` — currently the trading name "Broaden Labs". If the studio is
   incorporated, this should be the registered legal name. Nobody but the owner
   can supply this, so it is not something to infer.

`JURISDICTION` is **RESOLVED** and this entry previously said otherwise. It is
`'the State of Connecticut, United States'` (`legal.ts:26`), confirmed by the
owner, with the governing-law clause naming the state and the privacy policy
naming the Connecticut Data Privacy Act — see commit `1df773ca`.

Everything else in those documents was read out of the code it describes and is
asserted by `seo.e2e.ts`: the field lists from `project_inquiries` and
`newsletter_subscribers`, the one-way IP hash from `hash.ts`, and the "no
cookies, no analytics, no third-party scripts" claim from a search of `src/`
that found none. Counsel review is still advisable before relying on them.

---

## Known, measured, not yet explained

### `/start-a-project` has a ~960ms main-thread task on a throttled connection

**Status:** precisely characterised, cause not identified, **and no longer
reproducing.** Do not "fix" it before it is understood, and do not tighten the
gate on the strength of its absence.

**Update 2026-08-23.** Six clean `lhci autorun` runs across two dates put this
route at performance 92 / TBT 0ms — the same as the prerendered routes:
2026-08-08 gave 0ms on 3/3 runs, and 2026-08-23 gave 0ms on 3/3 runs after the
toolchain upgrade (Vite 8.0.16→8.2.2, Kit next.16→next.25, Svelte 5.56.8→10).
Lighthouse applies the throttling TODO named as the real variable, so the
condition is being exercised. Two caveats keep this from being a resolution:
the cause was never identified, and lhci requests this route last, so a
first-request-to-a-cold-server trigger would not be hit here regardless.

`lighthouse-assertions.cjs` therefore keeps its 0.6 floor rather than being
raised to match the others. Its comment previously read "Measured 68 and 69",
which the evidence above contradicts; it now records the measurements and why
the floor stays put.

**What is established, by measurement:**

- Lighthouse reports TBT ~1281-1373ms on this route and 0ms on the four
  prerendered routes.
- It reproduces outside Lighthouse. With Lighthouse's exact throttling
  (slow 4G, 150ms latency, 4x CPU) against a **pre-warmed** server:
  `/start-a-project` 960ms, `/insights/...` 54ms, `/work` 0ms.
- It is **not** server cold-start. TTFB in the run above was 2-4ms on all three
  routes. An earlier hypothesis that blamed a cold preview server was wrong; the
  real variable is network throttling, which the probe that produced that
  hypothesis did not apply.
- It is **not** JavaScript execution. A V8 CPU profile taken under the
  reproducing conditions attributes ~24ms to script and 179ms to `(program)`
  against 8,438ms idle. A Chrome trace shows the task as a bare `RunTask` whose
  largest nested entry is `RunMicrotasks`.
- It is route-specific and not explained by payload size: `/start-a-project`
  and `/insights/...` both transfer 114 KiB of script, and only one blocks.

**What is unique to the route:** it is the only route that is not prerendered,
and the only one carrying the remote-function form client and its valibot
schema.

**Next step:** a trace filtered to the reproducing conditions with
`disabled-by-default-v8.compile` included, to see whether the wall-clock is
script streaming/compilation that the sampler does not attribute.

**Meanwhile:** `lighthouse-assertions.cjs` holds this route to an explicitly
lower, commented performance floor rather than excluding it, so it cannot get
worse silently.

---

## Deferred by the brief

Both are explicitly optional and neither has a job on this site. Say the word
and either gets built.

- **§73 custom cursor** — §73 itself says to omit it if it "adds novelty without
  value".
- **§10 `query.live` demo** — §10 says "only if there is an actual useful
  live-data demonstration". It also uses SSE, whose behaviour on Vercel
  serverless is unverified.

---

## Closed

- **Responsive coverage of the brief's §82 widths** — `playwright.config.ts` had
  documented seven enterprise widths (820, 1024, 1280, 1440, 1728, 1920, 2560)
  since the beginning, but only 1440 and 2560 were rendered by any test; 820,
  1024, 1280, 1728 and 1920 had never been loaded at all. `responsive.e2e.ts`
  now sweeps all thirteen routes at all twelve widths in
  `src/lib/testing/breakpoints.ts` and asserts no horizontal overflow.

  It runs in **Chromium, Firefox and WebKit**, not one engine. The first version
  was Chromium-only on a cost argument that did not survive measurement: three
  engines is 36 tests and 468 route renders in 33.4s wall clock against 13.4s
  for one, because the tests parallelise across workers. Intrinsic grid and flex
  sizing is exactly where engines diverge, so a single-engine sweep would have
  been blind to the most likely responsive bug. All 468 renders are clean.

  The gate was verified to actually fail: injecting `min-inline-size: 110vw` on
  `.section` produced `1584 > 1441` and a clean red at 1440px.

- **Linux visual-regression baselines** — generated in
  `mcr.microsoft.com/playwright:v1.62.1-noble`, verified with three consecutive
  clean runs at 14/14, and committed to `src/__visual/linux/`. The CI `visual`
  job is a real gate; `continue-on-error` is gone.

  Generating them exposed a genuine flake: `font-display: optional` commits to
  the fallback for the rest of the page load if the font misses its ~100ms block
  period, so the homepage rendered 18,438px tall in one run and 18,712px in the
  next and a different test failed each time. `visual.e2e.ts` now loads each page
  twice and captures the second, when the font is cached and `optional` always
  uses it. Never visible on macOS, where the fonts were always warm.
