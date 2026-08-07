CREATE TYPE "public"."contact_event_kind" AS ENUM('inquiry_submitted', 'inquiry_rejected_validation', 'inquiry_rejected_duplicate', 'inquiry_rejected_throttle', 'inquiry_rejected_honeypot', 'newsletter_subscribed');--> statement-breakpoint
CREATE TYPE "public"."inquiry_status" AS ENUM('new', 'reviewing', 'responded', 'archived', 'spam');--> statement-breakpoint
CREATE TYPE "public"."subscriber_status" AS ENUM('pending', 'confirmed', 'unsubscribed');--> statement-breakpoint
CREATE TABLE "contact_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "contact_event_kind" NOT NULL,
	"ip_hash" text NOT NULL,
	"request_id" text,
	"inquiry_id" uuid,
	"fill_duration_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"status" "subscriber_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"company" text,
	"website" text,
	"project_type" text NOT NULL,
	"estimated_budget" text NOT NULL,
	"timeline" text NOT NULL,
	"message" text NOT NULL,
	"referral_source" text,
	"signal_summary" text,
	"consent" boolean DEFAULT false NOT NULL,
	"status" "inquiry_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contact_events" ADD CONSTRAINT "contact_events_inquiry_id_project_inquiries_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."project_inquiries"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contact_events_ip_hash_created_at_idx" ON "contact_events" USING btree ("ip_hash","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "contact_events_kind_idx" ON "contact_events" USING btree ("kind");--> statement-breakpoint
CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "project_inquiries_created_at_idx" ON "project_inquiries" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "project_inquiries_status_idx" ON "project_inquiries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "project_inquiries_email_idx" ON "project_inquiries" USING btree ("email");