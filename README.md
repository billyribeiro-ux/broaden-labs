# Broaden Labs

The Broaden Labs website. SvelteKit 3 preview, Svelte 5, PostgreSQL, no CSS
framework.

> **This targets a SvelteKit 3 PRERELEASE.** `@sveltejs/kit` is pinned to an
> exact `3.0.0-next.16` and must stay pinned — unmerged branches upstream
> suggest the remote-form API may still rename `submitted`, `withOverride` and
> `updates` before 3.0.0 final. Read `node_modules/@sveltejs/kit/types/index.d.ts`
> for API truth: **svelte.dev and the Svelte MCP still serve SvelteKit 2 docs**,
> and several of their examples throw in Kit 3.

## Prerequisites

- **Node ≥ 22.17** (Kit 3 requires it)
- **pnpm** — npm, yarn and bun are not supported here
- **PostgreSQL** running locally

## Setup

```sh
pnpm install
cp .env.example .env          # defaults point at a local Postgres
createdb broaden_labs
pnpm db:migrate
pnpm dev
```

## Commands

| Command                                         | What it does                                                |
| ----------------------------------------------- | ----------------------------------------------------------- |
| `pnpm dev`                                      | Dev server                                                  |
| `pnpm build` / `pnpm preview`                   | Production build and preview                                |
| `pnpm check`                                    | `svelte-check` under 8 strict TypeScript flags              |
| `pnpm lint` / `pnpm format`                     | Prettier + ESLint                                           |
| `pnpm test:unit`                                | Unit and integration tests (integration needs the database) |
| `pnpm test:e2e`                                 | Playwright, across 7 projects                               |
| `pnpm db:generate` / `db:migrate` / `db:studio` | Drizzle                                                     |
| `pnpm fonts:build`                              | Re-subset the webfonts (needs `fonttools` + `brotli`)       |
| `pnpm og:build`                                 | Re-render the social images                                 |
| `pnpm lighthouse`                               | Lighthouse CI: 5 URLs × 3 runs, then assert                 |

`pnpm lighthouse` builds, serves, and measures on **throttled mobile** — slow 4G
and 4x CPU, which is how Google evaluates the site. Thresholds live in
`lighthouse-assertions.cjs`; every one of them records the measured value it was
derived from, and `/start-a-project` is held to an explicitly lower, documented
bar rather than being quietly excluded. Chrome comes from Playwright's pinned
build so the score means the same thing locally and in CI.

## CI

`.github/workflows/ci.yml` — five jobs: types/lint/unit (against a real
Postgres 16 service), end-to-end across seven Playwright projects, visual
regression, Lighthouse, and a dependency audit. The pnpm version is read from
`packageManager` and the Node version from `engines`, so neither is pinned twice.

The `visual` job runs with `continue-on-error` until Linux baselines exist —
see "Evidence gaps" in `TODO.md` for exactly why and how to close it.

`pnpm test:e2e` always rebuilds — the Playwright `webServer` command is
`build && preview` and `reuseExistingServer` is off, because reusing a running
server silently tests a stale bundle.

## Demo content safety

Every case study, testimonial and team profile on this site is **fictional**, is
labelled as such on the page, and carries `isDemo: true`.

A Vite plugin **fails the production build** while any of them is enabled:

```sh
PUBLIC_SITE_ENV=production pnpm build   # exits 1, naming all 13 records
```

Set `BROADEN_CONTENT_READY=1` only once every one has been replaced with real,
verified content. Inventing _data_ is allowed; inventing _functionality_ or
_credentials_ is not.

## Architecture

- **`src/lib/styles/`** — hand-written CSS in cascade layers. No Tailwind, no
  utility framework. Colour tokens are enforced against WCAG 2.2 AA by
  `contrast.spec.ts`, which parses the values out of the stylesheet so a copy
  cannot drift.
- **`src/lib/content/`** — typed content. AUTHORED content (services, insights,
  process) is separate at the type level from CREDENTIAL content (case studies,
  testimonials, team), which requires `isDemo`.
- **`src/lib/animation/`** — GSAP. `{@attach}` is the ONE lifecycle primitive:
  its teardown fires both before a re-run and on element removal, which is
  exactly `ctx.revert()`'s contract. `gsap.context()` only adopts triggers
  created _synchronously_, so anything created in a promise must be killed by
  hand — that caused a real leak, and `motion.e2e.ts` exists to catch it.
- **`src/lib/components/three/`** — Threlte. The tier starts at `fallback` and
  only upgrades on the client, which is what makes it SSR-safe with no `browser`
  guard. three.js lives in `ApertureScene.svelte`, reached only through
  `import()` from `WebGLStage`, so it stays out of the initial payload. Force a
  tier by hand with `?tier=rich|medium|still|fallback`.

### The bundling boundaries, and why they are tested

`{#if}` gates rendering. `{@attach}` gates execution. **Neither gates bundling —
only `import()` does.** This project shipped that mistake twice, and both times
the code read as lazy while the bundle was not:

| Was                                                                                   | Cost                                                                                                                                                       | Now                                                                   |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `WebGLStage` imported `Canvas`/`three` at the top and gated `<Canvas>` behind `{#if}` | three.js in `nodes/2` — **763 KB raw / 192 KiB transferred**, downloaded by every mobile visitor including the `fallback` tier that never renders a canvas | `ApertureScene.svelte` behind `import()`; `nodes/2` is **13 KB**      |
| `+layout.svelte` imported `usePageTransitions` → `transitions.ts` → `gsap.ts`         | **122 KB of GSAP in the root layout chunk**, on every route including `/privacy`, to power a transition that cannot run until you navigate                 | `lazyAttach()` in `src/lib/animation/lazy.ts`; GSAP is one lazy chunk |

Neither was visible to TypeScript, ESLint or `svelte-check` — the only evidence
is the emitted chunk. So `src/lib/components/three/bundle.spec.ts` reads the
built output and fails if either library reappears in a route node. It skips
itself when there is no build (correct on a clean checkout) and CI runs it again
after `pnpm build`, where it counts.

Lighthouse found both. Homepage performance went **47 → 91-99**, with total
blocking time **1045ms → 0ms**.

- **`src/routes/**/*.remote.ts`** — remote functions. These may NOT live under
  `src/lib/server/`: Kit 3 treats any `/server/` path segment as server-only and
  rejects remote modules there.

## Fonts

Bricolage Grotesque, Instrument Sans and JetBrains Mono — all SIL OFL 1.1 with
no Reserved Font Name declared on their copyright lines, which is what makes
subsetting and axis pinning permitted. Licences ship in `static/licenses/`.

The `.woff2` files are build artifacts of `scripts/build-fonts.py`, not
hand-placed binaries. `wdth` is pinned to 100 on the two proportional faces: the
axis only condenses and cost 42% of Bricolage's file size on the preload path.

**CLS is held at zero by explicit `line-height` on every type token plus
preloading two latin subsets — not by the four-descriptor metric-override
recipe.** `ascent-override`, `descent-override` and `line-gap-override` are not
implemented in Safari at all.

## Deployment

Vercel, via `adapter-vercel@7`. Note it **removed the edge runtime** — everything
is Node, which is why one `pg` driver serves both local Postgres and production.

The runtime is **pinned to `nodejs24.x` in `vite.config.ts`**, not inferred.
Unset, the adapter's `resolve_runtime` falls through to reading the _build
container's_ `process.versions.node` and throws `Unsupported Node.js version` for
anything outside 22 or 24 — making a green deployment depend on a dropdown in the
Vercel dashboard rather than on anything in this repo. `packageManager` and
`engines.node` are pinned for the same reason: so the build is reproducible from
the repository alone.

Security headers are in `vercel.json`, not the Kit config, and
`docs/SECURITY-HEADERS.md` explains why they cannot work anywhere else. They do
apply despite the Build Output API also emitting a `routes` array: Vercel's
`vercel.json` reference states `routes` may be used "alongside `rewrites`,
`redirects`, `headers`, `cleanUrls`, and `trailingSlash`", and its `headers`
example is described as configuring response headers "for static files, Vercel
Functions, and a wildcard that matches all routes".

### Environment variables

A preview deployment needs **none of these** — the site is built so a first
deployment succeeds before any database or secret exists. A production
deployment needs exactly one, and it is a gate rather than a setting.

| Variable                | Required            | Effect if unset                                                            |
| ----------------------- | ------------------- | -------------------------------------------------------------------------- |
| `BROADEN_CONTENT_READY` | **Production only** | Production build **fails** and lists every demo record. This is the point. |
| `DATABASE_URL`          | For the form only   | Site builds and serves; the inquiry form returns an error and logs why.    |
| `PUBLIC_ORIGIN`         | No                  | Defaults to `https://broadenlabs.com`.                                     |
| `PUBLIC_CONTACT_EMAIL`  | No                  | Defaults to `hello@broadenlabs.com`.                                       |
| `PUBLIC_SITE_ENV`       | No                  | Falls back to `VERCEL_ENV`, which Vercel always sets.                      |

`PUBLIC_SITE_ENV` falling back to `VERCEL_ENV` is a safety property, not a
convenience. The content gate keys off it, so an unset variable used to mean
"development" on Vercel — and a production deploy would have shipped thirteen
fictional case studies, testimonials and metrics as real client proof.

Note what is **not** set: `kit.origin`. Left undefined, Kit derives the origin
per request from the adapter, so remote-function CSRF checks pass on preview
deployments whose `*.vercel.app` URL is unknown at build time. Pinning it to the
production domain would 403 every form submission on every preview.

**Before launch:**

1. Set `BROADEN_CONTENT_READY` only once the fictional content has been replaced
   with real work — see `docs/SECURITY-HEADERS.md` and `src/lib/content/demo/`.
2. Set `DATABASE_URL` to a pooled connection string.
3. Run migrations at deploy time from CI — never inside a request handler, where
   concurrent cold starts race the migration lock.
4. Have counsel write `/privacy`, `/terms` and `/accessibility`. They currently
   state that no policy exists and are `noindex` and absent from the sitemap.
5. Verify CSP against `pnpm build && pnpm preview` — **never** `pnpm dev`, which
   strips hashes and injects `unsafe-inline` for HMR.
6. Consider a dedicated secret for the IP hash salt; it currently derives from
   `DATABASE_URL` (stable per environment, but a real secret is better).

## Licence notes worth pre-declaring

Two dependencies will flag in an SPDX scanner and both are fine to ship:

- **gsap** uses a non-SPDX licence string ("Standard 'no charge' license").
  SplitText and ScrollTrigger have been in the free package since 3.13.0.
- **`@threlte/extras`** pulls `@threjs-kit/instanced-sprite-mesh`, which has no
  licence field at all. It is **deliberately not installed** — `@threlte/core`
  has zero runtime dependencies and the hero needs nothing else.

## Further reading

- `docs/SEO.md` — Google guidance as of 7 August 2026, with citations
- `docs/SECURITY-HEADERS.md` — why headers live at the platform
