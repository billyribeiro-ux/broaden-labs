# TODO

## Evidence gaps

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

**Still needs a human decision**, both in `src/lib/content/legal.ts`:

1. `ENTITY` — currently the trading name "Broaden Labs". If the studio is
   incorporated, this should be the registered legal name.
2. `JURISDICTION` — currently "the United States", inferred from hard evidence
   (the .com registration, the Vercel account, the `aws-us-east-1` database
   region) rather than guessed. A governing-law clause is stronger naming a
   state.

Everything else in those documents was read out of the code it describes and is
asserted by `seo.e2e.ts`: the field lists from `project_inquiries` and
`newsletter_subscribers`, the one-way IP hash from `hash.ts`, and the "no
cookies, no analytics, no third-party scripts" claim from a search of `src/`
that found none. Counsel review is still advisable before relying on them.

---

## Known, measured, not yet explained

### `/start-a-project` has a ~960ms main-thread task on a throttled connection

**Status:** precisely characterised, cause not identified. Do not "fix" it
before it is understood.

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
