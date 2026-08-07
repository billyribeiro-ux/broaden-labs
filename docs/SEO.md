# SEO implementation notes

Researched **7 August 2026**. Everything below is cited to a primary source —
Google Search Central, web.dev, or the SvelteKit docs. Nothing here is from
memory: the model's training cutoff predates several of these changes, and at
least three of them (FAQ deprecation, the AI-optimization guide, the preferred
image guidance) landed after it.

Re-check [the Search documentation changelog][changelog] before trusting this
file — it is a snapshot, not a standing truth.

---

## 1. What changed in 2026 that affects this site

| Date            | Change                                                                                                                                                                                                                                                      | Effect here                                                                                       |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **7 May 2026**  | **FAQ rich results deprecated.** No longer shown in Search; Search Console reporting, the Rich Results Test and the API dropped support through June–August 2026.                                                                                           | **None — and that is the point.** This site emits no `FAQPage`. Do not add it: it is dead markup. |
| **2 Mar 2026**  | **Preferred image guidance added.** A page's Search/Discover thumbnail can be steered with `og:image` _and_ schema.org (`primaryImageOfPage`, or `image` on the `mainEntity`).                                                                              | Implemented both. See §3.                                                                         |
| **24 Mar 2026** | Google documented how it processes **robots meta tags outside `<head>`**.                                                                                                                                                                                   | No action: `<svelte:head>` always emits into `<head>`.                                            |
| **15 May 2026** | **Generative AI optimization guide** published. Core message: generative AI features run on the same ranking systems, so **normal SEO is the optimization**.                                                                                                | No new markup. See §5.                                                                            |
| **15 Jun 2026** | Google clarified **`llms.txt` is not used by Google Search** — it neither helps nor harms.                                                                                                                                                                  | Shipped anyway, for a stated non-SEO reason. See §5.                                              |
| **10 Jul 2026** | Canonicalization troubleshooting updated with re-evaluation timeframes.                                                                                                                                                                                     | No action; canonical is explicit on every route.                                                  |
| —               | **Core Web Vitals are unchanged**: LCP, INP, CLS. INP replaced FID back in March 2024; no 2026 successor exists. Google's own lifecycle rules mean a stable metric cannot change more than once a year and a candidate must be public for six months first. | Targets in §6.                                                                                    |

> **Caution on "2026 SEO" advice generally.** Google added a page on
> [evaluating third-party SEO tools, services and advice][third-party] on
> 5 June 2026, and its AI guide explicitly names "AEO/GEO hacks" — chunking,
> AI text files, inauthentic mentions — as things to deprioritise in favour of
> ordinary SEO.

---

## 2. What SvelteKit gives us, and what it does not

From the [SvelteKit SEO docs][kit-seo]:

**Free, already correct in this project**

- **SSR on by default.** "Server-side rendered content is indexed more
  frequently and reliably." Every route here server-renders; the WebGL hero is
  the only client-only thing and it is decorative.
- **Normalized URLs.** Kit redirects trailing-slash variants, "as duplicate URLs
  are bad for SEO".
- **Low overhead → Core Web Vitals headroom.**

**Manual, and therefore ours to get right**

- Unique `<title>` and `<meta name="description">` per page, inside
  `<svelte:head>`.
- A sitemap endpoint. Kit documents the exact `+server.ts` shape used here.

**Deliberately NOT done: AMP.** Kit documents an AMP path
(`inlineStyleThreshold: Infinity`, `csr = false`, `@sveltejs/amp`). Google
[simplified its AMP documentation on 1 July 2026][changelog], removing the AMP
viewer, AMP Cache and signed exchange and sending users straight to publisher
pages. AMP buys this site nothing and would cost the entire interaction layer.

---

## 3. What is implemented

All of it lives in `src/lib/components/seo/Seo.svelte`, used by every route.

### Meta

- `<title>` and `<meta name="description">`, unique per route.
- `<link rel="canonical">` built from `PUBLIC_ORIGIN`, which is a **static** env
  var deliberately pinned to the production origin — a canonical pointing at a
  Vercel preview URL is how preview builds get indexed instead of the real site.
- **`<meta name="robots" content="max-image-preview:large, max-snippet:-1,
max-video-preview:-1">`.** The default for `max-image-preview` is `standard`;
  `large` permits "a larger image preview, up to the width of the viewport" and
  applies to "Google web search, Google Images, Discover, Assistant"
  ([robots meta tag docs][robots-meta]). This is the cheapest Discover-eligibility
  win available and costs nothing.
- `noindex, follow` on `/privacy`, `/terms`, `/accessibility` while they have no
  content, and they are omitted from the sitemap for the same reason.

**Not emitted, because Google ignores them:** `noarchive`, `nocache`,
`nositelinkssearchbox` — the robots-meta documentation states these "aren't used
by Google Search and are ignored". Emitting them is cargo cult.

### Open Graph and social

`og:type`, `og:title`, `og:description`, `og:url`, `og:image`, `og:site_name`,
`og:locale`, plus `twitter:card=summary_large_image` (the 1200×630 artwork would
be centre-cropped into illegibility by `summary`).

### Structured data (JSON-LD)

- `Organization` and `WebSite`, emitted once, with stable `@id`s so `Article`
  and `BreadcrumbList` can reference the publisher rather than duplicate it.
- `Article` on insight routes, with `primaryImageOfPage` — the March 2026
  preferred-image mechanism.
- `BreadcrumbList` on nested routes.

**Deliberately absent, per [§84 of the brief][] and Google's
[structured data policies][sd-policies]:** no `aggregateRating`, `review`,
`award`, `numberOfEmployees`, `address` or `ProfessionalService`. Broaden has no
reviews, no awards and no published address; asserting any of them in markup
would be fabricating a credential. `ProfessionalService` in particular implies a
service area and opening hours that do not exist.

**Also absent:** `FAQPage` (dead as of May 2026) and `Dataset` (Google clarified
in 2026 that it is used only by Dataset Search, not Google Search).

---

## 4. The honest gap

Google's preferred-image guidance says to "choose an image that's relevant and
representative of the page" and to **"avoid using a generic image (for example,
your site logo)"**.

This site currently ships **one** brand OG image for every route. That is fine
for link previews and wrong for Discover thumbnails, where a per-page image is
what the guidance asks for. Per-route images are generated for the top-level
routes by `scripts/build-og.mjs`; the dynamic routes (`/work/[slug]`,
`/insights/[slug]`) still fall back to the brand image.

Closing that fully means generating one image per case study and article. The
script already does the hard part — it renders authored HTML in a headless
browser using the real subset webfont — so this is a loop, not a redesign. It is
listed as a gap rather than quietly ignored.

---

## 5. AI features, AEO/GEO, and `llms.txt`

Google's [generative AI optimization guide][ai-guide] (15 May 2026) is
unambiguous:

- Generative AI features "are rooted in its core Search ranking and quality
  systems", so optimizing for them **is** SEO.
- A mythbusting section states you do **not** need new machine-readable files,
  AI text files, markup or Markdown to appear in Google Search including its
  generative features, because **Search does not use them**.
- Content "chunking" is explicitly dismissed — Google's systems handle multiple
  topics on one page.

**`llms.txt` decision.** This site ships one, and the reason is written into the
file itself: Google Search **ignores it entirely** — it "will neither harm nor
help visibility or rankings". It is here because Chrome Lighthouse added an
`llms.txt` check to its **Agentic Browsing** category in May 2026, and because
agent tooling outside Google reads it. It is an agent-affordance, not an SEO
measure, and must never be described as one.

---

## 6. Performance targets

From [Google's Core Web Vitals documentation][cwv] (last updated 2025-12-10) and
[web.dev][vitals]:

| Metric | Target  | Where it stands                                                                                  |
| ------ | ------- | ------------------------------------------------------------------------------------------------ |
| LCP    | < 2.5s  | Hero text is server-rendered; the two latin webfont subsets are preloaded (118 KB total)         |
| INP    | < 200ms | No blocking work on interaction; three.js is dynamically imported and never on the critical path |
| CLS    | **0**   | Measured at 390/768/1440/2560 in a real preview build — see `shell.e2e.ts`                       |

Google's own caveat, worth repeating: good scores "don't guarantee top rankings",
and chasing a perfect score "may not be the best use of your time". CLS is held
at zero because a shifting page is bad, not because of a ranking table.

---

## Sources

- [Latest Google Search Documentation Updates (changelog)][changelog]
- [Robots meta tag, data-nosnippet, and X-Robots-Tag][robots-meta]
- [General Structured Data Guidelines][sd-policies]
- [Optimizing your website for generative AI features on Google Search][ai-guide]
- [Understanding Core Web Vitals and Google Search results][cwv]
- [Web Vitals — web.dev][vitals]
- [Do you need an SEO? / evaluating third-party advice][third-party]
- [SvelteKit SEO documentation][kit-seo]

[changelog]: https://developers.google.com/search/updates
[robots-meta]: https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
[sd-policies]: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
[ai-guide]: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
[cwv]: https://developers.google.com/search/docs/appearance/core-web-vitals
[vitals]: https://web.dev/articles/vitals
[third-party]: https://developers.google.com/search/docs/fundamentals/do-i-need-seo
[kit-seo]: https://svelte.dev/docs/kit/seo
[§84 of the brief]: ../../Downloads/BROADEN%20LABS%20%E2%80%94%20MASTER%20WEBSITE%20ENGINEERING%20PROMPT.md
