# Security headers

## Why these live in `vercel.json` and not in the Kit config

SvelteKit's `csp` option can only emit a Content-Security-Policy, and on a
mostly-prerendered site it emits it as a `<meta http-equiv>` tag rather than a
response header. Kit's own `get_header(is_meta = true)` **skips
`frame-ancestors`, `report-uri` and `sandbox`**, because none of them can be
expressed in a meta tag.

Separately, `@sveltejs/adapter-vercel@7` has no `headers` option — its config
type is `{ runtime, regions, maxDuration, memory, split, isr }` plus `images` —
and it writes prerendered pages as plain files under `.vercel/output/static`,
which Vercel's CDN serves **without ever running the `handle` hook**.

So for the pages that make up most of this site, a header set in Kit or in a
hook would simply not exist. These have to be real response headers, configured
at the platform.

## What each one is for

| Header                                | Reason                                                                                                                                                                                                                                              |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Strict-Transport-Security`           | Two years, subdomains included. `preload` is deliberately **omitted** — submitting to the preload list is effectively irreversible and must not be done before every subdomain, including any future staging or mail host, is confirmed HTTPS-only. |
| `X-Frame-Options: DENY`               | The clickjacking protection `frame-ancestors` cannot provide here, because Kit drops that directive from the meta tag on prerendered pages. Belt and braces, deliberately.                                                                          |
| `X-Content-Type-Options: nosniff`     | Stops MIME sniffing turning a served file into script.                                                                                                                                                                                              |
| `Referrer-Policy`                     | `strict-origin-when-cross-origin` — full path to ourselves, origin only cross-site, nothing at all when downgrading.                                                                                                                                |
| `Permissions-Policy`                  | The site uses none of camera, microphone, geolocation, payment or USB, so all are denied rather than left at the default. `interest-cohort=()` opts out of cohort-based tracking.                                                                   |
| `Cross-Origin-Opener-Policy`          | Isolates the browsing context group.                                                                                                                                                                                                                |
| `Cache-Control` on `/_app/immutable/` | Content-hashed, so a year is safe and correct.                                                                                                                                                                                                      |

## CSP

Lives on the `sveltekit()` plugin in `vite.config.ts`, where Kit can hash inline
scripts it generates. Two things worth remembering:

1. **Keywords are written unquoted** — `['self']`, never `["'self'"]`. Kit quotes
   them itself; writing them pre-quoted emits `''self''`, which browsers reject,
   silently dropping the whole directive.
2. **Validate against `pnpm build && pnpm preview`, never `pnpm dev`.** In dev,
   Kit strips hashes and injects `unsafe-inline` so HMR can work, so a
   dev-validated policy proves nothing about production.

`upgrade-insecure-requests` is deliberately absent — see the comment in
`vite.config.ts` for the WebKit failure it caused and why it buys nothing here.
