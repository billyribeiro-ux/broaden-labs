import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
p.on('console', (m) => {
	if (m.type() === 'error') errs.push(m.text());
});
await p.goto('http://localhost:5199/');
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(2200);
await p.screenshot({ path: '/tmp/m5-hero.png' });
const motion = await p.evaluate(() =>
	window.__BROADEN_MOTION__
		? {
				scrollTriggers: window.__BROADEN_MOTION__.scrollTriggers(),
				ticker: window.__BROADEN_MOTION__.tickerListeners(),
				splits: window.__BROADEN_MOTION__.splits()
			}
		: 'registry missing'
);
console.log('motion registry:', JSON.stringify(motion));
console.log('console errors :', errs.length ? errs : 'none');
// Headline must keep its accessible name despite being split into lines
console.log(
	'h1 accessible name:',
	await p.getByRole('heading', { level: 1 }).getAttribute('aria-label')
);
await b.close();
