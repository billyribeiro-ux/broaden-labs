/**
 * The device widths this site is verified at. Brief §82.
 *
 * One list, imported by every spec that sweeps widths, because two hand-kept
 * lists drift and the drift is invisible: `shell.e2e.ts` and `visual.e2e.ts`
 * each sampled four widths while playwright.config.ts documented seven, and
 * nothing failed to point that out.
 *
 * Test-only. Nothing under `src/routes` imports this, so it never reaches a
 * client bundle — the boundary the bundle spec guards.
 */

/**
 * Brief §82's enterprise widths. Playwright ships no device descriptor at most
 * of these, which is why the specs set an explicit viewport instead of
 * pretending some phone or laptop descriptor matches.
 *
 * 820  — small tablet portrait, just past the 48rem grid breakpoint
 * 1024 — the 64rem desktop breakpoint itself
 * 1280 — the most common laptop width
 * 1440 — the editorial measure ceiling (--container-max, tokens.space.css:60)
 * 1728 — 16" MacBook Pro logical width
 * 1920 — standard desktop monitor
 * 2560 — the upper bound the fluid type scale is authored for
 */
export const ENTERPRISE_WIDTHS = [820, 1024, 1280, 1440, 1728, 1920, 2560] as const;

/**
 * The narrow end. 320 is the floor `tokens.type.css` computes its clamp slopes
 * from; 390 and 768 are the widths the visual baselines already pin; 360 and
 * 414 bracket the common Android and large-iPhone widths either side of them.
 */
export const MOBILE_WIDTHS = [320, 360, 390, 414, 768] as const;

/** Every width, narrow to wide. */
export const ALL_WIDTHS = [...MOBILE_WIDTHS, ...ENTERPRISE_WIDTHS];
