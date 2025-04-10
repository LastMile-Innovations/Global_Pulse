CREATE TYPE "public"."earning_status" AS ENUM('pending', 'available', 'requested', 'processing', 'paid_out', 'failed', 'cancelled', 'on_hold', 'expired');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('unread', 'read', 'archived', 'deleted', 'actioned');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('info', 'warning', 'error', 'success', 'payout', 'new_feature', 'survey_completion', 'earnings_update', 'system_maintenance', 'account_security', 'consent_update');--> statement-breakpoint
CREATE TYPE "public"."payout_status" AS ENUM('requested', 'approved', 'processing', 'completed', 'failed', 'cancelled', 'on_hold', 'rejected', 'scheduled');--> statement-breakpoint
CREATE TYPE "public"."purchase_status" AS ENUM('pending', 'awaiting_payment', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded', 'cancelled', 'disputed');--> statement-breakpoint
CREATE TYPE "public"."question_status" AS ENUM('draft', 'review', 'active', 'paused', 'archived', 'flagged', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('multipleChoice', 'sliderScale', 'buttons', 'openEnded', 'ranking', 'matrixGrid', 'imageChoice', 'nps', 'dateTime', 'dropdown');--> statement-breakpoint
CREATE TYPE "public"."response_source" AS ENUM('chat', 'survey_feed', 'embedded_widget', 'email_campaign', 'api', 'mobile_app', 'import');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin', 'moderator', 'analyst', 'support', 'guest');--> statement-breakpoint
CREATE TABLE "admin_audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_user_id" uuid NOT NULL,
	"action" text NOT NULL,
	"target_type" text,
	"target_id" text,
	"details" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_dataset_access_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"purchase_id" uuid NOT NULL,
	"accessor_identifier" text NOT NULL,
	"access_timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"details" jsonb
);
--> statement-breakpoint
CREATE TABLE "marketplace_pricing_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"rule_name" text NOT NULL,
	"price_per_answer" numeric(10, 4) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "marketplace_pricing_rules_rule_name_unique" UNIQUE("rule_name")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" DEFAULT 'info' NOT NULL,
	"status" "notification_status" DEFAULT 'unread' NOT NULL,
	"content" text NOT NULL,
	"link" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "payouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"status" "payout_status" DEFAULT 'requested' NOT NULL,
	"payout_method_info" jsonb,
	"provider_reference" text,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "marketplace_earnings" ALTER COLUMN "status" SET DATA TYPE earning_status;--> statement-breakpoint
ALTER TABLE "marketplace_purchases" ALTER COLUMN "status" SET DATA TYPE purchase_status;--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "type" SET DATA TYPE question_type;--> statement-breakpoint
ALTER TABLE "survey_responses" ALTER COLUMN "source" SET DATA TYPE response_source;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE user_role;--> statement-breakpoint
ALTER TABLE "marketplace_earnings" ADD COLUMN "payout_id" uuid;--> statement-breakpoint
ALTER TABLE "marketplace_purchases" ADD COLUMN "buyer_organization_id" uuid;--> statement-breakpoint
ALTER TABLE "marketplace_purchases" ADD COLUMN "buyer_user_id" uuid;--> statement-breakpoint
ALTER TABLE "marketplace_purchases" ADD COLUMN "payment_provider_ref" text;--> statement-breakpoint
ALTER TABLE "marketplace_purchases" ADD COLUMN "dataset_access_info" jsonb;--> statement-breakpoint
ALTER TABLE "marketplace_purchases" ADD COLUMN "updated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "status" "question_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "tags" text[];--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "updated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_admin_user_id_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_dataset_access_logs" ADD CONSTRAINT "marketplace_dataset_access_logs_purchase_id_marketplace_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."marketplace_purchases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_admin_user_idx" ON "admin_audit_logs" USING btree ("admin_user_id");--> statement-breakpoint
CREATE INDEX "audit_target_idx" ON "admin_audit_logs" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "access_log_purchase_idx" ON "marketplace_dataset_access_logs" USING btree ("purchase_id");--> statement-breakpoint
CREATE INDEX "access_log_accessor_idx" ON "marketplace_dataset_access_logs" USING btree ("accessor_identifier");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_status_idx" ON "notifications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payouts_user_id_idx" ON "payouts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "payouts_status_idx" ON "payouts" USING btree ("status");--> statement-breakpoint
ALTER TABLE "marketplace_earnings" ADD CONSTRAINT "marketplace_earnings_payout_id_payouts_id_fk" FOREIGN KEY ("payout_id") REFERENCES "public"."payouts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_purchases" ADD CONSTRAINT "marketplace_purchases_buyer_organization_id_organizations_id_fk" FOREIGN KEY ("buyer_organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_purchases" ADD CONSTRAINT "marketplace_purchases_buyer_user_id_users_id_fk" FOREIGN KEY ("buyer_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "earnings_payout_idx" ON "marketplace_earnings" USING btree ("payout_id");--> statement-breakpoint
CREATE INDEX "purchase_status_idx" ON "marketplace_purchases" USING btree ("status");--> statement-breakpoint
CREATE INDEX "purchase_buyer_org_idx" ON "marketplace_purchases" USING btree ("buyer_organization_id");--> statement-breakpoint
CREATE INDEX "purchase_buyer_user_idx" ON "marketplace_purchases" USING btree ("buyer_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_pseudonym_idx" ON "profiles" USING btree ("pseudonym");--> statement-breakpoint
CREATE INDEX "questions_status_idx" ON "questions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "questions_tags_idx" ON "questions" USING gin ("tags");--> statement-breakpoint
CREATE INDEX "responses_user_id_idx" ON "survey_responses" USING btree ("user_id");