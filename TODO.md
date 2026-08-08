# TODO

## Evidence gaps

Things that are genuinely not determinable from what is available here. Each
names what is missing, where it was looked for, and what it blocks. Nothing
below has been guessed at or filled in with a plausible value.

### Linux visual-regression baselines

**Missing:** `src/__visual/linux/` — 18 PNG baselines rendered on Linux.

**Looked in:** `src/__visual/` contains `darwin/` only. `playwright.config.ts`
sets `snapshotPathTemplate: '{testDir}/__visual/{platform}/{arg}{ext}'`, so
Playwright looks for a per-platform directory and finds none on Linux.

**Why they cannot be produced here:** baselines must be rendered on the platform
that will compare against them — font rasterisation and compositing differ
enough between macOS and Linux that a cross-platform diff is thousands of
antialiasing pixels and says nothing about whether the design changed. Producing
them locally needs the official Playwright container; `docker info` fails on this
machine, so there is no way to render them.

**Blocks:** the `visual` job in `.github/workflows/ci.yml` being a real gate. It
currently runs with `continue-on-error: true`, generates the baselines and
uploads them as the `visual-baselines-linux` artifact. Commit that artifact's
contents once, delete the `continue-on-error` line, and the gate is live.

### A real Vercel deployment

**Missing:** confirmation from an actual deploy.

**Looked in:** every failure mode was reproduced locally by clearing the
environment and setting `VERCEL_ENV` by hand, and the emitted
`.vercel/output/` was inspected directly — function runtime, `config.json`
routes, and a cold boot of the handler with no environment at all.

**Why:** deploying needs the owner's Vercel account. Simulation is not the same
as a deploy, and is not reported as one.

**Blocks:** nothing in the repository. Flagged so the distinction stays honest.

### Legal copy

**Missing:** `/privacy`, `/terms`, `/accessibility` say plainly that no policy
has been written. They are `noindex` and absent from the sitemap.

**Why:** this is counsel's work, not engineering's. Inventing a privacy policy
would be inventing a legal commitment.

---

## Known, measured, not yet fixed

### `/start-a-project` blocks the main thread for ~1.2s on a cold start

**Status:** partially explained, not resolved.

**Evidence:** Lighthouse reports TBT 1281ms on this route and 0–8ms on every
other route measured. Reproduced outside Lighthouse with a Playwright probe at
4x CPU throttling: one long task of 1270ms, and zero long tasks on `/work` under
identical conditions.

**What it is not:** not JavaScript execution. A V8 CPU profile attributes 1376ms
to `(program)` and only 23ms to any script. Not the GSAP chunk either — `/work`
loads the same chunk with zero blocking, and this was measured again after GSAP
was moved out of the layout.

**What is suspicious:** it only reproduces when this route is the first request
against a freshly started preview server. Warming the server with any other
route first drops it to 0ms. `/start-a-project` is the only route that is not
prerendered, so it is the only one whose first response runs the SSR handler
cold — but a slow server response is TTFB, not a main-thread long task, so that
explanation is incomplete.

**Next step:** capture a full Chrome trace (`Tracing.start` with the
`disabled-by-default-devtools.timeline` category) rather than a sampling
profile, which is what would name a `(program)` task. Do not "fix" it before it
is understood; the cause may be the local preview server rather than the site.

---

## Deferred by the brief

Both are explicitly optional and neither has a job on this site. Say the word
and either gets built.

- **§73 custom cursor** — §73 itself says to omit it if it "adds novelty without
  value".
- **§10 `query.live` demo** — §10 says "only if there is an actual useful
  live-data demonstration". It also uses SSE, whose behaviour on Vercel
  serverless is unverified.
