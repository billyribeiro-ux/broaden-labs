<script lang="ts">
	import Seo from '#lib/components/seo/Seo.svelte';
	import LegalDocument from '#lib/components/legal/LegalDocument.svelte';
	import { PUBLIC_CONTACT_EMAIL } from '$app/env/public';
	import { ENTITY } from '#lib/content/legal';

	/**
	 * An accessibility STATEMENT, in the form the EN 301 549 / Section 508 model
	 * expects: conformance claim, how it was tested, known limitations, and a
	 * feedback route with a response commitment.
	 *
	 * Every claim here is measured, not asserted. axe-core runs against every
	 * route on five browser configurations in src/routes/shell.e2e.ts under the
	 * WCAG 2.2 AA tag set plus heading-order; colour pairs are verified against
	 * the relative-luminance formula by contrast.spec.ts, which parses the values
	 * out of the stylesheet so a copy cannot drift; and CLS is asserted to be
	 * exactly zero at four viewports.
	 *
	 * The limitations section is honest on purpose. A statement that claims full
	 * conformance with no exceptions is the one nobody believes.
	 */
</script>

<Seo
	title="Accessibility Statement — Broaden Labs"
	description="Broaden Labs' accessibility statement: our WCAG 2.2 AA conformance claim, how the site is tested, known limitations, and how to report a barrier."
/>

<LegalDocument
	eyebrow="Accessibility"
	title="Accessibility Statement"
	lede="We build to WCAG 2.2 Level AA and test it automatically on every change. Where something falls short, we would rather say so here than let you find it."
>
	<h2>Our commitment</h2>
	<p>
		{ENTITY} is committed to making this website usable by everyone, including people who use screen readers,
		keyboard navigation, magnification, or who prefer reduced motion. Accessibility is treated as a build
		requirement, not a review step.
	</p>

	<h2>Conformance status</h2>
	<p>
		This website aims to conform to the <a
			href="https://www.w3.org/TR/WCAG22/"
			rel="noopener noreferrer">Web Content Accessibility Guidelines (WCAG) 2.2</a
		>
		at Level AA. We consider the site substantially conformant: automated testing reports no violations,
		and the manual checks listed below pass. "Substantially" rather than "fully" because automated tools
		cannot detect every barrier, and we would rather state a claim we can defend.
	</p>

	<h2>How this is tested</h2>
	<ul>
		<li>
			Automated auditing with axe-core against every page, on Chromium, Firefox, WebKit, a mobile
			viewport and with JavaScript disabled — run on every change, blocking release.
		</li>
		<li>
			Colour contrast verified arithmetically against the WCAG relative-luminance formula, reading
			the values out of the stylesheet so documentation cannot drift from what ships.
		</li>
		<li>
			Manual keyboard checks: skip link from a fresh page load, visible focus on every interactive
			element, focus trapped and returned correctly by the mobile menu, and form errors announced.
		</li>
		<li>
			Layout stability measured at 390, 768, 1440 and 2560 pixels, including on a slow connection.
		</li>
	</ul>

	<h2>Accessibility features</h2>
	<ul>
		<li>Semantic HTML with a single main landmark and a correct heading order on every page.</li>
		<li>A skip link as the first focusable element on every page.</li>
		<li>Visible focus indicators that meet the non-text contrast requirement.</li>
		<li>
			Full functionality without JavaScript, including the project inquiry form, which submits and
			validates on the server.
		</li>
		<li>
			Full respect for <code>prefers-reduced-motion</code>. Animation is an enhancement; with
			reduced motion enabled the site renders complete and static, with no content revealed by
			motion.
		</li>
		<li>
			Decorative visuals, including the animated hero, are hidden from assistive technology and
			carry no information. Nothing meaningful exists only inside a canvas.
		</li>
		<li>Text resizes to 200% without loss of content or function.</li>
	</ul>

	<h2>Known limitations</h2>
	<ul>
		<li>
			<strong>Text selection colour on iOS.</strong> Safari on iOS does not support styling the selection
			highlight, so selected text uses the system default rather than our higher-contrast pair. This affects
			appearance only.
		</li>
		<li>
			<strong>Third-party content.</strong> Where we link to external sites, we cannot control their accessibility.
		</li>
		<li>
			<strong>Automated testing has limits.</strong> Automated tools detect a minority of possible barriers.
			If you hit one we have not found, please tell us — that report is more useful than another tool.
		</li>
	</ul>

	<h2>Feedback</h2>
	<p>
		If you encounter a barrier on this site, email
		<a href="mailto:{PUBLIC_CONTACT_EMAIL}">{PUBLIC_CONTACT_EMAIL}</a>. Please tell us the page,
		what you were trying to do, and the browser or assistive technology you were using. We aim to
		respond within five working days, and we will tell you what we intend to do and when — including
		if the answer is that we cannot fix it quickly.
	</p>
	<p>If you would like information from this site in another format, ask and we will provide it.</p>
</LegalDocument>
