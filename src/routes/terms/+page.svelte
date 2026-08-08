<script lang="ts">
	import Seo from '#lib/components/seo/Seo.svelte';
	import LegalDocument from '#lib/components/legal/LegalDocument.svelte';
	import { PUBLIC_CONTACT_EMAIL } from '$app/env/public';
	import { ENTITY, JURISDICTION } from '#lib/content/legal';

	/**
	 * Terms for a marketing website — not a services agreement.
	 *
	 * The distinction matters and is stated in the document itself: nothing here
	 * creates an engagement or binds either party to a project. Client work is
	 * governed by a separate signed contract. Blurring the two is the most common
	 * defect in website terms, because it implies obligations that the site
	 * cannot actually create.
	 *
	 * The demo-content clause is not boilerplate — it is the legally load-bearing
	 * part of this page while the case studies remain fictional, and it says so
	 * in the same words the pages themselves use.
	 */
</script>

<Seo
	title="Terms of Use — Broaden Labs"
	description="Terms governing use of the Broaden Labs website: what the content is, what it is not, and the limits of what this site creates between us."
/>

<LegalDocument
	eyebrow="Terms"
	title="Terms of Use"
	lede="These terms cover your use of this website. They do not create a client engagement — project work is governed by a separate written agreement."
>
	<h2>Agreement</h2>
	<p>
		By using this website you agree to these terms. If you do not agree, please do not use the site.
		{ENTITY} may update these terms; the date at the top of this page shows when they last changed, and
		continued use after a change means you accept it.
	</p>

	<h2>This site does not create an engagement</h2>
	<p>
		Nothing on this website is an offer, a quotation, or a commitment to perform work. Submitting
		the inquiry form starts a conversation and nothing more. No engagement exists until both parties
		sign a written agreement setting out scope, fees and terms. Where those terms and these ones
		differ, the signed agreement governs.
	</p>

	<h2>Demonstration content</h2>
	<p>
		Some content on this site is clearly-labelled demonstration material. Case studies,
		testimonials, team profiles and the metrics attached to them are fictional and exist so the
		templates could be built and tested honestly. They are marked as such where they appear. They
		are not statements of past performance and must not be relied on, cited, or reproduced as real
		client outcomes.
	</p>

	<h2>Information, not advice</h2>
	<p>
		Articles and technical writing on this site are general information about software engineering.
		They are not professional advice for your situation, and no client relationship is created by
		reading them. Decisions you make based on them are your own.
	</p>

	<h2>Intellectual property</h2>
	<p>
		The design, text, code, images and structure of this site belong to {ENTITY} or its licensors, except
		where third-party licences apply — the typefaces are used under the SIL Open Font License, and the
		licences are published on this site. You may read, link to and quote the site with attribution. You
		may not copy it wholesale, present it as your own, or use it to train a model that reproduces it.
	</p>

	<h2>Acceptable use</h2>
	<ul>
		<li>Do not submit false information, or another person's details without their permission.</li>
		<li>Do not attempt to gain unauthorised access to the site or its infrastructure.</li>
		<li>Do not use automated tools to flood the forms or to scrape the site at volume.</li>
		<li>Do not use the site for anything unlawful.</li>
	</ul>
	<p>
		Submissions are rate limited and abusive ones are discarded. We may restrict access to the site
		to protect it.
	</p>

	<h2>Availability</h2>
	<p>
		The site is provided as it is. We do not guarantee it will be uninterrupted or error free, and
		we may change or remove any part of it without notice.
	</p>

	<h2>Links to other sites</h2>
	<p>
		Where we link to a site we do not operate, we are not responsible for its content or its
		practices. Its terms and privacy policy apply once you leave here.
	</p>

	<h2>Liability</h2>
	<p>
		To the fullest extent the law allows, {ENTITY} is not liable for indirect, incidental or consequential
		loss arising from your use of this website. Nothing in these terms excludes liability that cannot
		lawfully be excluded — including liability for death or personal injury caused by negligence, or for
		fraud.
	</p>

	<h2>Governing law</h2>
	<p>
		These terms are governed by the laws of {JURISDICTION}, without regard to conflict-of-law rules.
	</p>

	<h2>Contact</h2>
	<p>
		Questions about these terms: <a href="mailto:{PUBLIC_CONTACT_EMAIL}">{PUBLIC_CONTACT_EMAIL}</a>.
	</p>
</LegalDocument>
