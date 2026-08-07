import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { CASE_STUDIES } from '../src/lib/content/demo/case-studies.ts';
import { INSIGHTS } from '../src/lib/content/insights.ts';

/**
 * Renders the social-share image. Brief §84, §108.
 *
 * Uses Playwright — already a dependency — rather than adding Satori and a
 * native rasteriser for one 1200x630 PNG. Satori's value is templating arbitrary
 * per-page text from a server; this site's URL space is small and the artwork is
 * one authored composition, so a headless render at build time gives the same
 * result with no new dependency, no native binary, and no runtime cost.
 *
 * The artwork is ours: the aperture motif and the real subset webfont, so it is
 * unambiguously licensable (§108 bans stock imagery for exactly this reason).
 *
 * DRIVEN FROM THE CONTENT MODULES, not a hand-written list. Google's preferred
 * image guidance (2 March 2026) says to choose an image "relevant and
 * representative of the page" and explicitly to avoid a generic one such as a
 * site logo — so every case study and article gets its own headline, and adding
 * content to the registry automatically produces its image. A hand-maintained
 * list here would drift and silently reintroduce the generic fallback.
 *
 * Run: pnpm og:build
 */

// `new URL('../', ...)` already points AT the project root, so dirname() would
// climb one level too far and resolve paths against the parent directory.
const root = fileURLToPath(new URL('..', import.meta.url));
const out = path.join(root, 'static', 'og');
mkdirSync(out, { recursive: true });

// The real shipped subset, inlined so the render does not depend on a network
// fetch or on the font being installed on the build machine.
const displayFont = readFileSync(
	path.join(root, 'src/lib/assets/fonts/bricolage-var-latin.woff2')
).toString('base64');
const monoFont = readFileSync(
	path.join(root, 'src/lib/assets/fonts/jetbrains-var-latin.woff2')
).toString('base64');

const render = (entry: OgPage) => `<!doctype html>
<html><head><meta charset="utf-8" /><style>
  @font-face { font-family: 'Bricolage'; src: url(data:font/woff2;base64,${displayFont}) format('woff2'); font-weight: 200 800; }
  @font-face { font-family: 'JetBrains'; src: url(data:font/woff2;base64,${monoFont}) format('woff2'); font-weight: 100 800; }
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; background: #090A0C; color: #F3F1EA;
         font-family: 'Bricolage'; display: flex; flex-direction: column;
         justify-content: space-between; padding: 72px; position: relative; overflow: hidden; }
  .field { position: absolute; inset: 0; }
  .field rect { fill: none; stroke: #78C5F2; stroke-width: 1; }
  .eyebrow { font-family: 'JetBrains'; font-size: 20px; letter-spacing: 0.16em;
             text-transform: uppercase; color: #92959B; display: flex; align-items: center; gap: 16px; }
  .eyebrow::before { content: ''; width: 40px; height: 1px; background: #289DD7; }
  h1 { font-size: 78px; font-weight: 800; line-height: 0.98; letter-spacing: -0.025em;
       max-width: 15ch; font-variation-settings: 'opsz' 96; position: relative; }
  .mark { font-size: 30px; font-weight: 800; letter-spacing: 0.04em;
          font-variation-settings: 'opsz' 96; position: relative; }
  .foot { display: flex; align-items: center; gap: 20px; position: relative; }
  .demo { font-family: 'JetBrains'; font-size: 16px; letter-spacing: 0.14em;
          text-transform: uppercase; color: #289DD7; border: 1px solid #289DD7;
          padding: 6px 12px; }
</style></head>
<body>
  <svg class="field" viewBox="0 0 1200 630" preserveAspectRatio="none">
    ${Array.from({ length: 8 * 12 }, (_, i) => {
			const col = i % 12,
				row = Math.floor(i / 12),
				depth = row / 7;
			const x = 600 + col * 56 + depth * 28;
			const y = 132 + row * 62 + depth * 10;
			const w = 46 - depth * 12,
				h = 34 - depth * 10;
			return `<rect x="${x}" y="${y}" width="${w}" height="${h}" opacity="${(0.5 - depth * 0.42).toFixed(3)}" />`;
		}).join('')}
  </svg>
  <div class="eyebrow">${entry.eyebrow}</div>
  <h1>${entry.headline}</h1>
  <div class="foot">
    <span class="mark">BROADEN</span>
    ${entry.demo ? '<span class="demo">Demo — fictional client</span>' : ''}
  </div>
</body></html>`;

interface OgPage {
	readonly slug: string;
	readonly eyebrow: string;
	readonly headline: string;
	/** Marks the artwork as representing fictional content. */
	readonly demo?: boolean;
}

/**
 * Per-route images, DRIVEN FROM THE CONTENT MODULES.
 *
 * Google's preferred-image guidance (2 March 2026) says to choose an image
 * "relevant and representative of the page" and explicitly to AVOID a generic
 * one such as a site logo. One brand image for every route is exactly what it
 * warns against.
 *
 * The case-study and article lists are DERIVED rather than hand-written, so
 * adding content to the registry produces its image automatically. A duplicated
 * list here would drift and silently reintroduce the generic fallback for
 * whatever it missed.
 */
const TOP_LEVEL: readonly OgPage[] = [
	{
		slug: 'default',
		eyebrow: 'Software · Platforms · Digital Experiences',
		headline: 'Software that expands what your business can become.'
	},
	{
		slug: 'work',
		eyebrow: 'Selected work',
		headline: 'Work where design and engineering have to agree.'
	},
	{
		slug: 'services',
		eyebrow: 'Capabilities',
		headline: 'We engineer the product—and the system that makes it possible.'
	},
	{
		slug: 'about',
		eyebrow: 'About Broaden',
		headline: 'Built for the space between the idea and the system it requires.'
	},
	{
		slug: 'insights',
		eyebrow: 'Insights',
		headline: 'Thinking about products, systems, and the decisions between them.'
	},
	{
		slug: 'start-a-project',
		eyebrow: 'Start a project',
		headline: "Tell us what you're trying to make possible."
	}
];

/**
 * Case-study cards carry a DEMO badge on the artwork itself.
 *
 * A social card is the one surface where a fictional client name travels
 * WITHOUT the page's own disclosure attached to it: someone shares the link,
 * the card renders in a feed, and nothing on it says the engagement is
 * invented. Putting the label in the image means it travels with the claim.
 */
const WORK: readonly OgPage[] = CASE_STUDIES.map((study) => ({
	slug: `work-${study.slug}`,
	eyebrow: `${study.client} · ${study.category}`,
	headline: study.headline,
	demo: true
}));

const ARTICLES: readonly OgPage[] = INSIGHTS.map((insight) => ({
	slug: `insights-${insight.slug}`,
	eyebrow: insight.category,
	headline: insight.title
}));

const PAGES: readonly OgPage[] = [...TOP_LEVEL, ...WORK, ...ARTICLES];

const browser = await chromium.launch();
const page = await browser.newPage({
	viewport: { width: 1200, height: 630 },
	deviceScaleFactor: 1
});

for (const entry of PAGES) {
	await page.setContent(render(entry), { waitUntil: 'load' });
	await page.evaluate(() => document.fonts.ready);
	await page.screenshot({ path: path.join(out, `${entry.slug}.png`) });
	console.log(`wrote static/og/${entry.slug}.png`);
}

await browser.close();
