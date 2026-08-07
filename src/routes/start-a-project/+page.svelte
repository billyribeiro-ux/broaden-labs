<script lang="ts">
	import Eyebrow from '#lib/components/typography/Eyebrow.svelte';
	import DisplayHeading from '#lib/components/typography/DisplayHeading.svelte';
	import Field from '#lib/components/forms/Field.svelte';
	import Aperture from '#lib/components/motion/Aperture.svelte';
	import { submitProjectInquiry } from './inquiry.remote';
	import {
		inquirySchema,
		PROJECT_TYPES,
		BUDGET_RANGES,
		TIMELINES,
		REFERRAL_SOURCES
	} from '#lib/schemas/inquiry';
	import { PUBLIC_CONTACT_EMAIL } from '$app/env/public';

	/**
	 * The inquiry form. Brief §58, §59.
	 *
	 * `preflight(inquirySchema)` runs the SAME schema on the client before the
	 * request, so obvious mistakes are caught without a round trip while the
	 * server still validates everything independently. The schema is imported
	 * from a shared module because it cannot be exported from a .remote.ts file.
	 *
	 * Spread order matters: `{...form.fields.x.as('text')}` goes FIRST and our
	 * own id / aria-describedby after, or Kit's attributes clobber ours.
	 */
	const form = submitProjectInquiry.preflight(inquirySchema);

	const result = $derived(form.result);
	// `pending` is a COUNT of in-flight submissions, not a boolean.
	const pending = $derived(form.pending > 0);
</script>

<svelte:head>
	<title>Start a project — Broaden Labs</title>
	<meta
		name="description"
		content="Tell us where the product is today, where it needs to go, and what is making that difficult."
	/>
</svelte:head>

<section class="section section--tight">
	<div class="container">
		<div class="grid">
			<div class="span-8-4 intro">
				<Eyebrow>Start a project</Eyebrow>
				<DisplayHeading level={1} size="lg" measure={false}>
					Tell us what you're trying to make possible.
				</DisplayHeading>
				<p class="lede">You don't need a finished brief.</p>
				<p class="lede">
					Tell us where the product is today, where it needs to go, and what is making that
					difficult. We'll start there.
				</p>
			</div>
		</div>
	</div>
</section>

<section class="section section--flush-top">
	<div class="container">
		<Aperture mode="bracket" />

		{#if result?.status === 'success'}
			<!--
				The success state REPLACES the form rather than sitting above it, so
				there is no way to read it as "submitted, and also here is the form
				again". role="status" announces it without stealing focus.
			-->
			<div class="outcome" role="status">
				<DisplayHeading size="md" measure={false}>Message received.</DisplayHeading>
				<p>
					Thanks for telling us about the project. We'll review the details and follow up using the
					email you provided.
				</p>
				<p class="reference">Reference <code>{result.reference}</code></p>
				<p class="muted">
					Prefer email? <a href="mailto:{PUBLIC_CONTACT_EMAIL}">{PUBLIC_CONTACT_EMAIL}</a>
				</p>
			</div>
		{:else}
			{#if result?.status === 'duplicate'}
				<div class="banner" role="status">
					<strong>We already have this one.</strong>
					<span>
						An identical message arrived a moment ago, so we have not created a second copy. Nothing
						else is needed from you.
					</span>
				</div>
			{:else if result?.status === 'throttled'}
				<div class="banner" role="status">
					<strong>That's a few messages in quick succession.</strong>
					<span>
						We have the earlier ones. If something was wrong with them, email
						<a href="mailto:{PUBLIC_CONTACT_EMAIL}">{PUBLIC_CONTACT_EMAIL}</a>
						directly and it will reach the same place.
					</span>
				</div>
			{:else if result?.status === 'error'}
				<!--
					Brief §97: not a generic "something went wrong". It states what did
					and did not happen, confirms nothing was lost, and offers a route
					that does not depend on the thing that just failed.
				-->
				<div class="banner banner--error" role="alert">
					<strong>That didn't make it through.</strong>
					<span>
						Your message has not been submitted and nothing was lost — the text is still below. Try
						again, or send it to
						<a href="mailto:{PUBLIC_CONTACT_EMAIL}">{PUBLIC_CONTACT_EMAIL}</a>.
					</span>
				</div>
			{/if}

			<!--
				`novalidate` on purpose. Brief §59: "Do not rely solely on browser
				validation."

				Without it the browser's own constraint check runs FIRST and blocks
				submission, so our schema never executes and the visitor gets a native
				bubble instead of the associated, announced, consistently-worded error
				this form is built to produce. Native bubbles cannot be styled, are
				worded differently in every browser, vanish on blur, and are not
				reliably announced.

				The `type` attributes stay — they still drive the right mobile keyboard
				and autofill behaviour. Only the enforcement moves to our schema, which
				is the same one the server runs.
			-->
			<form {...form} class="form" novalidate>
				<div class="row">
					<Field
						label="First name"
						id="first-name"
						required
						issues={form.fields.firstName.issues()}
					>
						{#snippet children({ id, describedBy })}
							<input
								{...form.fields.firstName.as('text')}
								{id}
								aria-describedby={describedBy}
								autocomplete="given-name"
							/>
						{/snippet}
					</Field>

					<Field label="Last name" id="last-name" required issues={form.fields.lastName.issues()}>
						{#snippet children({ id, describedBy })}
							<input
								{...form.fields.lastName.as('text')}
								{id}
								aria-describedby={describedBy}
								autocomplete="family-name"
							/>
						{/snippet}
					</Field>
				</div>

				<Field label="Work email" id="email" required issues={form.fields.email.issues()}>
					{#snippet children({ id, describedBy })}
						<input
							{...form.fields.email.as('email')}
							{id}
							aria-describedby={describedBy}
							autocomplete="email"
						/>
					{/snippet}
				</Field>

				<div class="row">
					<Field label="Company" id="company" issues={form.fields.company.issues()}>
						{#snippet children({ id, describedBy })}
							<input
								{...form.fields.company.as('text')}
								{id}
								aria-describedby={describedBy}
								autocomplete="organization"
							/>
						{/snippet}
					</Field>

					<Field
						label="Website"
						id="website"
						hint="Include https://"
						issues={form.fields.website.issues()}
					>
						{#snippet children({ id, describedBy })}
							<input
								{...form.fields.website.as('url')}
								{id}
								aria-describedby={describedBy}
								autocomplete="url"
							/>
						{/snippet}
					</Field>
				</div>

				<Field
					label="What are you looking to build?"
					id="project-type"
					required
					issues={form.fields.projectType.issues()}
				>
					{#snippet children({ id, describedBy })}
						<select {...form.fields.projectType.as('select')} {id} aria-describedby={describedBy}>
							<option value="">Choose one</option>
							{#each PROJECT_TYPES as type (type)}
								<option value={type}>{type}</option>
							{/each}
						</select>
					{/snippet}
				</Field>

				<div class="row">
					<Field
						label="Estimated investment"
						id="budget"
						required
						hint="A range, not a commitment. It helps us suggest a sensible shape of engagement."
						issues={form.fields.estimatedBudget.issues()}
					>
						{#snippet children({ id, describedBy })}
							<select
								{...form.fields.estimatedBudget.as('select')}
								{id}
								aria-describedby={describedBy}
							>
								<option value="">Choose one</option>
								{#each BUDGET_RANGES as range (range)}
									<option value={range}>{range}</option>
								{/each}
							</select>
						{/snippet}
					</Field>

					<Field
						label="Desired timeline"
						id="timeline"
						required
						issues={form.fields.timeline.issues()}
					>
						{#snippet children({ id, describedBy })}
							<select {...form.fields.timeline.as('select')} {id} aria-describedby={describedBy}>
								<option value="">Choose one</option>
								{#each TIMELINES as timeline (timeline)}
									<option value={timeline}>{timeline}</option>
								{/each}
							</select>
						{/snippet}
					</Field>
				</div>

				<Field
					label="Tell us about the project"
					id="message"
					required
					hint="Where the product is now, where it needs to go, and what is making that hard."
					issues={form.fields.message.issues()}
				>
					{#snippet children({ id, describedBy })}
						<!--
							`as('text')`, not `as('textarea')` — there is no textarea entry in
							Kit's InputTypeMap. The 'text' variant is the right one anyway: it
							is the only case that omits a `type` attribute from the returned
							props, which is exactly what a <textarea> needs.
						-->
						<textarea
							{...form.fields.message.as('text')}
							{id}
							aria-describedby={describedBy}
							rows="8"></textarea>
					{/snippet}
				</Field>

				<Field
					label="How did you hear about Broaden?"
					id="referral"
					issues={form.fields.referralSource.issues()}
				>
					{#snippet children({ id, describedBy })}
						<select
							{...form.fields.referralSource.as('select')}
							{id}
							aria-describedby={describedBy}
						>
							<option value="">Prefer not to say</option>
							{#each REFERRAL_SOURCES as source (source)}
								<option value={source}>{source}</option>
							{/each}
						</select>
					{/snippet}
				</Field>

				<div class="consent">
					<input {...form.fields.consent.as('checkbox')} id="consent" />
					<label for="consent">
						I'm happy for Broaden Labs to store these details and reply to me about this project.
					</label>
				</div>
				<p class="consent-error" aria-live="polite">
					{#if form.fields.consent.issues()}
						{form.fields.consent.issues()?.[0]?.message}
					{/if}
				</p>

				<!--
					Honeypot. Positioned off-screen rather than display:none — some bots
					skip hidden fields, and a field that is not rendered cannot be
					filled at all. aria-hidden and tabindex="-1" keep it away from
					anyone using a keyboard or a screen reader, and autocomplete="off"
					stops a password manager filling it on a real person's behalf.
				-->
				<div class="honeypot" aria-hidden="true">
					<label for="website2">Leave this field empty</label>
					<input
						{...form.fields.website2.as('text')}
						id="website2"
						tabindex="-1"
						autocomplete="off"
					/>
				</div>

				<div class="actions">
					<button type="submit" class="submit" disabled={pending}>
						{pending ? 'Sending…' : 'Start the conversation'}
					</button>
					<p class="muted">We reply from a real address, not a no-reply.</p>
				</div>
			</form>
		{/if}
	</div>
</section>

<style>
	.intro {
		display: grid;
		gap: var(--space-md);
		justify-items: start;
	}

	.lede {
		max-inline-size: var(--measure-lede);
		font-size: var(--text-lg);
		line-height: var(--lh-relaxed);
		color: var(--text-secondary);
	}

	.form {
		display: grid;
		gap: var(--space-md);
		max-inline-size: 44rem;
		margin-block-start: var(--space-xl);
	}

	.row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
		gap: var(--space-md);
	}

	.consent {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-2xs);
		align-items: start;
		margin-block-start: var(--space-2xs);
	}

	.consent input {
		inline-size: 20px;
		block-size: 20px;
		margin-block-start: 0.15em;
		accent-color: var(--accent);
	}

	.consent label {
		font-size: var(--text-sm);
		line-height: var(--lh-relaxed);
		color: var(--text-secondary);
	}

	.consent-error {
		min-block-size: 1lh;
		font-size: var(--text-sm);
		color: var(--danger);
	}

	/* Off-screen, not display:none — see the markup comment. */
	.honeypot {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	.actions {
		display: grid;
		gap: var(--space-2xs);
		justify-items: start;
		margin-block-start: var(--space-sm);
	}

	.submit {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-block-size: 52px;
		padding-inline: var(--space-lg);

		font-size: var(--text-base);
		font-weight: var(--weight-semibold);
		letter-spacing: var(--tracking-wide);

		color: var(--on-accent);
		background-color: var(--accent);
		border-radius: var(--radius-xs);

		transition: background-color var(--dur-instant) var(--ease-exit);
	}

	.submit:hover:not(:disabled) {
		background-color: var(--accent-hover);
		transition-duration: var(--dur-fast);
		transition-timing-function: var(--ease-entrance);
	}

	.submit:disabled {
		cursor: progress;
		opacity: 0.7;
	}

	.muted {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		color: var(--text-muted);
	}

	.outcome {
		display: grid;
		gap: var(--space-md);
		justify-items: start;
		max-inline-size: 44rem;
		margin-block-start: var(--space-xl);
		padding: var(--space-lg);
		border-inline-start: var(--border-thick) solid var(--accent);
		background-color: var(--surface-secondary);
	}

	.outcome p {
		font-size: var(--text-lg);
		line-height: var(--lh-relaxed);
		color: var(--text-secondary);
	}

	.reference {
		font-family: var(--font-mono);
	}

	.reference code {
		color: var(--accent);
	}

	.banner {
		display: grid;
		gap: var(--space-3xs);
		max-inline-size: 44rem;
		margin-block-start: var(--space-lg);
		padding: var(--space-md);
		font-size: var(--text-sm);
		line-height: var(--lh-relaxed);
		color: var(--text-secondary);
		border-inline-start: var(--border-thick) solid var(--accent);
		background-color: var(--surface-secondary);
	}

	.banner strong {
		font-size: var(--text-base);
		color: var(--text-primary);
	}

	.banner--error {
		border-inline-start-color: var(--danger);
	}
</style>
