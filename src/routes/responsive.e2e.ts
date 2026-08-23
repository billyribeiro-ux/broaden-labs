import { test, expect } from '@playwright/test';
import { ALL_WIDTHS } from '#lib/testing/breakpoints';

/**
 * Responsive layout integrity across the enterprise device widths. Brief §82.
 *
 * §82's widths were already quoted in playwright.config.ts but only two of the
 * seven (1440 and 2560) were verified anywhere in the suite: `shell.e2e.ts`
 * samples CLS at 390/768/1440/2560 and `visual.e2e.ts` captures the same four.
 * 820, 1024, 1280, 1728 and 1920 were never rendered by a test. The design
 * system is fluid — `--gutter` and the whole type scale are `clamp()`
 * expressions authored for 320→2560px (tokens.type.css:25) — and the grid has
 * only two breakpoints (48rem, 64rem in grid.css). Fluid systems fail between
 * their breakpoints, not at them, which is exactly where the gap was.
 *
 * What this asserts is deliberately narrow and objective: no route may scroll
 * horizontally at any supported width. A document wider than its viewport is
 * unambiguous — it is not a judgement about whether the design looks right, it
 * is the one responsive defect that is never intentional. Aesthetic regressions
 * remain the visual suite's job.
 *
 * Runs in Chromium, Firefox AND WebKit, which is the opposite of the visual
 * suite and deliberately so. A screenshot baseline cannot be shared across
 * engines — font rasterisation alone defeats it — but a box-geometry assertion
 * is engine-independent by construction: either the document is wider than the
 * viewport or it is not. Intrinsic sizing of grid and flex items is precisely
 * where engines disagree, so a Chromium-only sweep would be blind to the most
 * likely class of responsive bug.
 *
 * The cost objection does not survive measurement: these tests parallelise
 * across workers, so all three engines together finish in roughly the wall-clock
 * of one. `deviceScaleFactor` differs between the Desktop Chrome and Desktop
 * Safari descriptors, which is irrelevant here — CSS pixels, not device pixels.
 */

/**
 * Every static route, plus one representative of each dynamic route family and
 * the 404. One slug per family rather than all eighteen: the templates are
 * shared, so a second case study exercises the same layout as the first, and
 * `routes.e2e.ts` already proves every slug renders.
 */
const ROUTES = [
	'/',
	'/about',
	'/work',
	'/work/meridian-markets',
	'/services',
	'/services/real-time-systems',
	'/insights',
	'/insights/ai-features-need-failure-design',
	'/start-a-project',
	'/privacy',
	'/terms',
	'/accessibility',
	'/work/does-not-exist'
] as const;

test.describe('responsive layout', () => {
	for (const width of ALL_WIDTHS) {
		test(`no horizontal overflow at ${width}px`, async ({ page }) => {
			await page.setViewportSize({ width, height: 900 });

			for (const route of ROUTES) {
				// `tier=fallback` forces the deterministic SVG hero instead of the WebGL
				// canvas, for the same reason visual.e2e.ts does: a GPU-sized canvas is
				// not a stable thing to measure a layout against.
				await page.goto(`${route}${route.includes('?') ? '&' : '?'}tier=fallback`, {
					waitUntil: 'load'
				});
				await page.evaluate(() => document.fonts.ready);
				// Reveal animations translate elements on the way in. Measuring mid-flight
				// would report a transform as an overflow, so this samples at rest.
				await page.waitForTimeout(600);

				const { scrollWidth, clientWidth, offenders } = await page.evaluate(() => {
					const vw = document.documentElement.clientWidth;
					const offenders: string[] = [];

					if (document.documentElement.scrollWidth > vw + 1) {
						for (const el of document.querySelectorAll('body *')) {
							const r = el.getBoundingClientRect();
							if (r.width === 0 && r.height === 0) continue;
							if (r.right > vw + 1) {
								const cls =
									typeof el.className === 'string' && el.className.trim()
										? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
										: '';
								offenders.push(
									`${el.tagName.toLowerCase()}${cls} right=${Math.round(r.right)} width=${Math.round(r.width)}`
								);
							}
						}
					}

					return {
						scrollWidth: document.documentElement.scrollWidth,
						clientWidth: vw,
						// Only the outermost few are useful; a single overflowing parent
						// drags all of its descendants into the list.
						offenders: offenders.slice(0, 5)
					};
				});

				// 1px of tolerance absorbs subpixel rounding on fractional grid tracks.
				expect(
					scrollWidth,
					`${route} at ${width}px overflows by ${scrollWidth - clientWidth}px` +
						(offenders.length ? `\n  ${offenders.join('\n  ')}` : '')
				).toBeLessThanOrEqual(clientWidth + 1);

				/**
				 * The other half of the problem, and the half that shipped.
				 *
				 * Overflow catches content that is too WIDE. It is structurally blind
				 * to content that is too NARROW, because a squeezed column never
				 * widens the document — so all 468 renders above passed while the
				 * named grid spans were collapsing to a single 4-column track: 71px
				 * wide at a 390px viewport, body copy wrapping at two words per line,
				 * 13 such elements on the homepage, and the page running 18,118px
				 * tall. `grid.css` declared those spans only inside the 48rem and
				 * 64rem queries, so below 768px they fell through to auto-placement.
				 *
				 * Below the 48rem breakpoint the design system's own rule is that
				 * every named span is full width, so anything materially narrower
				 * than its container is the bug rather than a judgement call. The
				 * threshold is 80% of the content box: generous enough that padding
				 * and borders never trip it, tight enough that a single track of a
				 * 4-column grid (25%) cannot hide.
				 */
				if (width < 768) {
					const narrow = await page.evaluate(() => {
						const found: string[] = [];
						for (const el of document.querySelectorAll('[class*="span-"]')) {
							const parent = el.parentElement;
							if (!parent) continue;
							const own = el.getBoundingClientRect().width;
							const avail = parent.getBoundingClientRect().width;
							if (avail === 0 || own === 0) continue;
							if (own < avail * 0.8) {
								const cls =
									typeof el.className === 'string' ? el.className.split(/\s+/)[0] : '(unknown)';
								found.push(
									`${el.tagName.toLowerCase()}.${cls} is ${Math.round(own)}px of ${Math.round(avail)}px available (${Math.round((own / avail) * 100)}%)`
								);
							}
						}
						return found;
					});

					expect(
						narrow,
						`${route} at ${width}px has named grid spans collapsed below full width:\n  ${narrow.join('\n  ')}`
					).toEqual([]);
				}
			}
		});
	}
});
