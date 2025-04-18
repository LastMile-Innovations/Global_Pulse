CREATE TYPE "public"."contact_category" AS ENUM('general', 'support', 'feedback', 'privacy', 'security', 'ethics', 'feature_request', 'bug_report', 'other');--> statement-breakpoint
CREATE TYPE "public"."contact_status" AS ENUM('new', 'in_progress', 'responded', 'closed', 'spam');--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"category" "contact_category" NOT NULL,
	"message" text NOT NULL,
	"status" "contact_status" DEFAULT 'new' NOT NULL,
	"admin_notes" text,
	"ip_address" varchar(50),
	"responded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "contact_user_id_idx" ON "contact_messages" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "contact_status_idx" ON "contact_messages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contact_category_idx" ON "contact_messages" USING btree ("category");--> statement-breakpoint
CREATE INDEX "contact_created_at_idx" ON "contact_messages" USING btree ("created_at");