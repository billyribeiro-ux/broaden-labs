import { and, eq, gte, sql } from 'drizzle-orm';
import { db } from '../index.ts';
import {
	projectInquiries,
	contactEvents,
	newsletterSubscribers,
	type NewProjectInquiry,
	type ProjectInquiry
} from '../schema.ts';

/**
 * Inquiry persistence and abuse control. Brief §59, §90.
 *
 * SvelteKit provides no rate limiting — the remote-function endpoint is a public
 * unauthenticated POST — so the throttle here is the actual control. Vercel's
 * WAF counters are per-region and Hobby allows one dashboard-only rule, which
 * makes them a supplement, not the mechanism.
 */

/** Two submissions per address per hour is generous for a studio contact form. */
const THROTTLE_WINDOW_MS = 60 * 60 * 1000;
const THROTTLE_MAX = 2;

/** The same email describing the same thing twice in 10 minutes is a double-submit. */
const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;

export type SubmitOutcome =
	| { readonly kind: 'created'; readonly inquiry: ProjectInquiry }
	| { readonly kind: 'duplicate' }
	| { readonly kind: 'throttled' };

export async function countRecentEvents(ipHash: string, windowMs: number): Promise<number> {
	const since = new Date(Date.now() - windowMs);
	const [row] = await db
		.select({ total: sql<number>`count(*)::int` })
		.from(contactEvents)
		.where(and(eq(contactEvents.ipHash, ipHash), gte(contactEvents.createdAt, since)));

	return row?.total ?? 0;
}

export async function recordEvent(event: {
	kind: (typeof contactEvents.$inferInsert)['kind'];
	ipHash: string;
	requestId?: string | undefined;
	inquiryId?: string | undefined;
	fillDurationMs?: number | undefined;
}): Promise<void> {
	await db.insert(contactEvents).values({
		kind: event.kind,
		ipHash: event.ipHash,
		requestId: event.requestId ?? null,
		inquiryId: event.inquiryId ?? null,
		fillDurationMs: event.fillDurationMs ?? null
	});
}

/**
 * Persists an inquiry, refusing duplicates and throttled callers.
 *
 * The throttle is checked BEFORE the insert and the duplicate check is a
 * bounded time window rather than a unique constraint, because the same person
 * legitimately enquires twice about different projects — a constraint would
 * reject the second real enquiry, which is a worse failure than accepting a
 * rare double.
 */
export async function submitInquiry(
	input: NewProjectInquiry,
	context: { ipHash: string; requestId?: string | undefined; fillDurationMs?: number | undefined }
): Promise<SubmitOutcome> {
	const recent = await countRecentEvents(context.ipHash, THROTTLE_WINDOW_MS);
	if (recent >= THROTTLE_MAX) {
		await recordEvent({ kind: 'inquiry_rejected_throttle', ...context });
		return { kind: 'throttled' };
	}

	const duplicateSince = new Date(Date.now() - DUPLICATE_WINDOW_MS);
	const [existing] = await db
		.select({ id: projectInquiries.id })
		.from(projectInquiries)
		.where(
			and(
				eq(projectInquiries.email, input.email),
				eq(projectInquiries.message, input.message),
				gte(projectInquiries.createdAt, duplicateSince)
			)
		)
		.limit(1);

	if (existing) {
		await recordEvent({ kind: 'inquiry_rejected_duplicate', ...context });
		return { kind: 'duplicate' };
	}

	const [inquiry] = await db.insert(projectInquiries).values(input).returning();
	if (!inquiry) {
		// insert().returning() returning nothing would mean the row did not land;
		// failing loudly is correct here rather than reporting success.
		throw new Error('Inquiry insert returned no row.');
	}

	await recordEvent({ kind: 'inquiry_submitted', inquiryId: inquiry.id, ...context });
	return { kind: 'created', inquiry };
}

/**
 * Subscribes an address, idempotently.
 *
 * Subscribing twice is the same intent, so this upserts rather than erroring —
 * and deliberately does NOT reveal whether the address was already present.
 * A form that says "already subscribed" is an email-enumeration oracle.
 */
export async function subscribe(email: string): Promise<void> {
	await db
		.insert(newsletterSubscribers)
		.values({ email })
		.onConflictDoUpdate({
			target: newsletterSubscribers.email,
			set: { updatedAt: new Date() }
		});
}

export const throttleConfig = {
	windowMs: THROTTLE_WINDOW_MS,
	max: THROTTLE_MAX,
	duplicateWindowMs: DUPLICATE_WINDOW_MS
} as const;
