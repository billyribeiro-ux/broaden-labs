import {
	pgTable,
	uuid,
	text,
	timestamp,
	boolean,
	integer,
	index,
	uniqueIndex,
	pgEnum
} from 'drizzle-orm/pg-core';

/**
 * Database schema. Brief §11, §12.
 *
 * Three decisions worth stating:
 *
 * 1. IDs are server-generated UUIDs (`gen_random_uuid()`, built into Postgres 13+
 *    with no extension). A serial primary key on a public form endpoint leaks
 *    total submission count to anyone who submits twice.
 *
 * 2. Timestamps are `timestamptz`, always. A `timestamp` without a zone stores a
 *    wall-clock reading with no way to know which wall it was on, and this data
 *    will be read from more than one.
 *
 * 3. No raw IP address is ever stored. `contact_events` keeps a salted hash,
 *    which is enough to rate-limit and count, and is not enough to identify.
 */

export const inquiryStatus = pgEnum('inquiry_status', [
	'new',
	'reviewing',
	'responded',
	'archived',
	'spam'
]);

export const subscriberStatus = pgEnum('subscriber_status', [
	'pending',
	'confirmed',
	'unsubscribed'
]);

export const contactEventKind = pgEnum('contact_event_kind', [
	'inquiry_submitted',
	'inquiry_rejected_validation',
	'inquiry_rejected_duplicate',
	'inquiry_rejected_throttle',
	'inquiry_rejected_honeypot',
	'newsletter_subscribed'
]);

export const projectInquiries = pgTable(
	'project_inquiries',
	{
		id: uuid('id').primaryKey().defaultRandom(),

		firstName: text('first_name').notNull(),
		lastName: text('last_name').notNull(),
		email: text('email').notNull(),
		company: text('company'),
		website: text('website'),

		projectType: text('project_type').notNull(),
		estimatedBudget: text('estimated_budget').notNull(),
		timeline: text('timeline').notNull(),
		message: text('message').notNull(),
		referralSource: text('referral_source'),

		/** Optional summary produced by the Project Signal planner. */
		signalSummary: text('signal_summary'),

		consent: boolean('consent').notNull().default(false),
		status: inquiryStatus('status').notNull().default('new'),

		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		// The triage query is "newest first", so the index is ordered to match.
		index('project_inquiries_created_at_idx').on(table.createdAt.desc()),
		index('project_inquiries_status_idx').on(table.status),
		// Not unique: the same person legitimately enquires twice about different
		// projects. Duplicate suppression is a time window, enforced in the
		// repository, not a constraint that would reject a real second enquiry.
		index('project_inquiries_email_idx').on(table.email)
	]
);

export const newsletterSubscribers = pgTable(
	'newsletter_subscribers',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		email: text('email').notNull(),
		status: subscriberStatus('status').notNull().default('pending'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		// Here uniqueness IS correct: subscribing twice is the same intent, and the
		// insert upserts rather than erroring.
		uniqueIndex('newsletter_subscribers_email_key').on(table.email)
	]
);

/**
 * Audit and abuse-control events. Brief §12, §92.
 *
 * Deliberately holds no message body and no personal data — the point is to be
 * able to answer "was this endpoint abused, and did a submission succeed",
 * without becoming a second copy of the inquiry table.
 */
export const contactEvents = pgTable(
	'contact_events',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		kind: contactEventKind('kind').notNull(),

		/** Salted SHA-256 of the client address. Never the address itself. */
		ipHash: text('ip_hash').notNull(),

		/** Correlates with the request id in the structured log. */
		requestId: text('request_id'),

		/** Set only when the event produced a row, so the audit trail can join. */
		inquiryId: uuid('inquiry_id').references(() => projectInquiries.id, {
			onDelete: 'set null'
		}),

		/** Milliseconds between form render and submit — a bot signal, not a timer. */
		fillDurationMs: integer('fill_duration_ms'),

		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		// The throttle query is "events for this hash since T", so the composite
		// index is ordered to serve it directly rather than filtering after a scan.
		index('contact_events_ip_hash_created_at_idx').on(table.ipHash, table.createdAt.desc()),
		index('contact_events_kind_idx').on(table.kind)
	]
);

export type ProjectInquiry = typeof projectInquiries.$inferSelect;
export type NewProjectInquiry = typeof projectInquiries.$inferInsert;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type ContactEvent = typeof contactEvents.$inferSelect;
export type NewContactEvent = typeof contactEvents.$inferInsert;
