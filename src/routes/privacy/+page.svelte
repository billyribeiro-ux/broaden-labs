<script lang="ts">
	import Seo from '#lib/components/seo/Seo.svelte';
	import LegalDocument from '#lib/components/legal/LegalDocument.svelte';
	import { PUBLIC_CONTACT_EMAIL } from '$app/env/public';
	import {
		ENTITY,
		PROCESSORS,
		INQUIRY_FIELDS,
		TECHNICAL_FIELDS,
		RETENTION_MONTHS
	} from '#lib/content/legal';

	/**
	 * Written from what the code actually does, not from a template.
	 *
	 * Every claim below is checkable: the field lists come from
	 * `project_inquiries` and `newsletter_subscribers` in
	 * src/lib/server/db/schema.ts, the IP claim from `hashClientAddress` in
	 * hash.ts, and the "no cookies, no analytics" claim from a search of src/
	 * that found no cookie API, no analytics SDK and no third-party script.
	 *
	 * A privacy policy that overstates protections is a false statement to users
	 * and regulators; one that under-declares collection is worse. This declares
	 * exactly what is stored, including the two things a template would omit —
	 * the fill-duration timer and the request id.
	 */
</script>

<Seo
	title="Privacy Policy — Broaden Labs"
	description="How Broaden Labs handles personal information: what the inquiry form stores, how long it is kept, and how to have it deleted. No cookies, no analytics, no tracking."
/>

<LegalDocument
	eyebrow="Privacy"
	title="Privacy Policy"
	lede="This site sets no cookies, runs no analytics and loads no third-party scripts. The only personal information we hold is what you choose to type into a form."
>
	<h2>Who we are</h2>
	<p>
		{ENTITY} operates this website. For any question about this policy, or to exercise any of the rights
		described below, email
		<a href="mailto:{PUBLIC_CONTACT_EMAIL}">{PUBLIC_CONTACT_EMAIL}</a>.
	</p>

	<h2>What we collect, and only what we collect</h2>
	<p>
		We do not use cookies, analytics, advertising pixels, session recording or any third-party
		script. Browsing this site does not create a record of you.
	</p>

	<h3>If you submit the project inquiry form</h3>
	<ul>
		{#each INQUIRY_FIELDS as field (field)}
			<li>{field}</li>
		{/each}
	</ul>

	<h3>If you subscribe to updates</h3>
	<ul>
		<li>Your email address, and whether the subscription is pending, confirmed or cancelled.</li>
	</ul>

	<h3>Collected automatically when you submit a form</h3>
	<p>These exist to stop abuse of a public, unauthenticated endpoint. Nothing else is recorded.</p>
	<ul>
		{#each TECHNICAL_FIELDS as field (field)}
			<li>{field}</li>
		{/each}
	</ul>
	<p>
		Your IP address is never written to our database. It is combined with a secret and hashed one
		way, so the stored value can confirm that two submissions came from the same source but cannot
		be turned back into an address.
	</p>

	<h2>Why we hold it</h2>
	<p>
		To reply to your enquiry, to send the updates you asked for, and to rate-limit automated abuse.
		We do not sell personal information, share it for advertising, or use it to build a profile of
		you. We do not make automated decisions that produce legal or similarly significant effects.
	</p>
	<p>
		Where the law requires a lawful basis, ours is your consent for updates, and our legitimate
		interest in responding to enquiries and protecting the service from abuse.
	</p>

	<h2>Who else can see it</h2>
	<p>
		Only the providers that run the site. Each processes data on our instructions and nothing more.
	</p>
	<table>
		<thead>
			<tr><th>Provider</th><th>Purpose</th><th>Location</th></tr>
		</thead>
		<tbody>
			{#each PROCESSORS as processor (processor.name)}
				<tr>
					<td>{processor.name}</td>
					<td>{processor.role}</td>
					<td>{processor.region}</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<p>
		Both are located in the United States. If you contact us from outside the United States, your
		information will be transferred to and stored there.
	</p>

	<h2>How long we keep it</h2>
	<p>
		Enquiries are kept for {RETENTION_MONTHS} months from your last contact with us, then deleted. Subscriptions
		are kept until you unsubscribe. Abuse-prevention records are kept for 12 months. We will delete anything
		sooner if you ask.
	</p>

	<h2>Your rights</h2>
	<p>
		Depending on where you live, you may have the right to access the information we hold about you,
		correct it, delete it, obtain a copy of it, object to or restrict how we use it, and withdraw
		consent at any time. If you are in the EU or UK you may also complain to your data protection
		authority. If you are in California, you have the rights described in the CCPA as amended,
		including the right not to be discriminated against for exercising them — and note that we do
		not sell or share personal information as those terms are defined there.
	</p>
	<p>
		To exercise any of these, email
		<a href="mailto:{PUBLIC_CONTACT_EMAIL}">{PUBLIC_CONTACT_EMAIL}</a>. We will respond within 30
		days. We may ask you to confirm the email address you originally used, because it is the only
		identifier we hold.
	</p>

	<h2>Children</h2>
	<p>
		This site is for business enquiries and is not directed at children. We do not knowingly collect
		information from anyone under 16.
	</p>

	<h2>Security</h2>
	<p>
		The site is served over HTTPS with strict transport security. Form submissions are validated on
		the server, rate limited, and protected against cross-site request forgery. Access to
		submissions is limited to the people who need it to reply to you. No system is perfectly secure,
		and we do not claim otherwise.
	</p>

	<h2>Changes</h2>
	<p>
		If we change this policy we will update the date at the top of this page. Material changes will
		be described here rather than made quietly.
	</p>
</LegalDocument>
