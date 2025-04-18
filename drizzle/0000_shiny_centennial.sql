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
CREATE TABLE "anonymized_flag_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_hash" varchar(64) NOT NULL,
	"session_hash" varchar(64) NOT NULL,
	"flagged_at" timestamp with time zone NOT NULL,
	"mode" varchar(50) NOT NULL,
	"response_type" varchar(50) NOT NULL,
	"selected_tags" text[],
	"comment_length" integer,
	"time_since_session_start" integer,
	"flag_sequence_in_session" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resonance_flag_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"period_type" varchar(20) NOT NULL,
	"period" varchar(50) NOT NULL,
	"total_flags" integer NOT NULL,
	"tag_distribution" jsonb NOT NULL,
	"mode_distribution" jsonb NOT NULL,
	"response_type_distribution" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "buyer_intent_declarations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"intent_type" varchar(50) NOT NULL,
	"intent_description" text NOT NULL,
	"product_category" varchar(100),
	"budget" varchar(50),
	"timeframe" varchar(50),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_id" varchar(21) NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"tool_calls" jsonb,
	"tool_results" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chats" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text DEFAULT 'New Conversation' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"topic_id" varchar(50),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "conversation_states" (
	"chat_id" varchar(50) PRIMARY KEY NOT NULL,
	"last_question_type" varchar(20) DEFAULT 'open-ended' NOT NULL,
	"question_count" integer DEFAULT 0 NOT NULL,
	"structured_question_count" integer DEFAULT 0 NOT NULL,
	"open_ended_question_count" integer DEFAULT 0 NOT NULL,
	"preference_ratio" numeric DEFAULT '0.5' NOT NULL,
	"topic_focus" varchar(100),
	"last_question_timestamp" numeric DEFAULT extract(epoch from now()) * 1000 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "data_access_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"contact_name" varchar(255) NOT NULL,
	"organization_name" varchar(255) NOT NULL,
	"contact_email" varchar(255) NOT NULL,
	"contact_phone" varchar(50),
	"intent_declaration" text NOT NULL,
	"policy_acknowledged" boolean NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"review_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "external_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"source_name" varchar(255) NOT NULL,
	"encrypted_refresh_token" text NOT NULL,
	"encrypted_access_token" text,
	"token_expiry" timestamp with time zone,
	"status" varchar(20) DEFAULT 'disconnected' NOT NULL,
	"last_synced_at" timestamp with time zone,
	"error_message" text,
	"metadata" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coherence_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"message_id" varchar(255) NOT NULL,
	"coherence_score" varchar(20) NOT NULL,
	"feedback" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "resonance_flags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"flagged_interaction_id" varchar(255) NOT NULL,
	"preceding_interaction_id" varchar(255),
	"mode_at_time_of_flag" varchar(50) NOT NULL,
	"response_type_at_time_of_flag" varchar(100) NOT NULL,
	"selected_tags" text[],
	"optional_comment" text,
	"client_timestamp" timestamp with time zone NOT NULL,
	"server_timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed" boolean DEFAULT false NOT NULL,
	"review_notes" text,
	"processed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "learning_updates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"feedback_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"attachment_id" varchar(255) NOT NULL,
	"property_changed" varchar(50) NOT NULL,
	"old_value" numeric NOT NULL,
	"new_value" numeric NOT NULL,
	"delta" numeric NOT NULL,
	"rule_applied" varchar(100) NOT NULL,
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
CREATE TABLE "marketplace_earnings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_pseudonym" uuid NOT NULL,
	"purchase_item_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"payout_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone
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
CREATE TABLE "marketplace_purchase_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"purchase_id" uuid NOT NULL,
	"question_id" integer NOT NULL,
	"answer_count_requested" integer NOT NULL,
	"price_per_answer" numeric(10, 4) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"buyer_identifier" text NOT NULL,
	"buyer_organization_id" uuid,
	"buyer_user_id" uuid,
	"purchase_date" timestamp with time zone DEFAULT now() NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"payment_provider_ref" text,
	"dataset_access_info" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
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
	"status" text DEFAULT 'requested' NOT NULL,
	"payout_method_info" jsonb,
	"provider_reference" text,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text DEFAULT 'info' NOT NULL,
	"status" text DEFAULT 'unread' NOT NULL,
	"content" text NOT NULL,
	"link" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"parameters" jsonb NOT NULL,
	"topic_id" varchar(50),
	"tags" text[],
	"is_generated" boolean DEFAULT false NOT NULL,
	"generation_context" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "survey_responses" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"question_id" integer NOT NULL,
	"option_id" varchar(50),
	"numeric_value" numeric,
	"text_value" text,
	"source" text DEFAULT 'chat' NOT NULL,
	"chat_id" varchar(21),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"engagement_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "topics_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"first_name" text,
	"last_name" text,
	"avatar_url" text,
	"marketplace_consent_structured_answers" boolean DEFAULT false NOT NULL,
	"pseudonym" uuid DEFAULT gen_random_uuid() NOT NULL,
	"completed_first_chat" boolean DEFAULT false NOT NULL,
	"completed_first_survey" boolean DEFAULT false NOT NULL,
	"viewed_explore" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "profiles_pseudonym_unique" UNIQUE("pseudonym")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "waitlist_activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"waitlist_user_id" uuid,
	"action" text NOT NULL,
	"details" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "waitlist_invitations" (
	"id" serial PRIMARY KEY NOT NULL,
	"waitlist_user_id" uuid NOT NULL,
	"invitation_code" varchar(24) NOT NULL,
	"status" text DEFAULT 'sent' NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"accepted_at" timestamp with time zone,
	"batch_id" integer,
	CONSTRAINT "waitlist_invitations_invitation_code_unique" UNIQUE("invitation_code")
);
--> statement-breakpoint
CREATE TABLE "waitlist_referrals" (
	"id" serial PRIMARY KEY NOT NULL,
	"referrer_id" uuid NOT NULL,
	"referred_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "waitlist_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "waitlist_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "waitlist_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"interest" text,
	"referral_code" varchar(16) NOT NULL,
	"referred_by_code" varchar(16),
	"priority_score" integer DEFAULT 0 NOT NULL,
	"referral_count" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"email_preferences" jsonb,
	"privacy_accepted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "waitlist_users_email_unique" UNIQUE("email"),
	CONSTRAINT "waitlist_users_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_admin_user_id_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buyer_intent_declarations" ADD CONSTRAINT "buyer_intent_declarations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_states" ADD CONSTRAINT "conversation_states_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_access_requests" ADD CONSTRAINT "data_access_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_connections" ADD CONSTRAINT "external_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coherence_feedback" ADD CONSTRAINT "coherence_feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resonance_flags" ADD CONSTRAINT "resonance_flags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_updates" ADD CONSTRAINT "learning_updates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_dataset_access_logs" ADD CONSTRAINT "marketplace_dataset_access_logs_purchase_id_marketplace_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."marketplace_purchases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_earnings" ADD CONSTRAINT "marketplace_earnings_purchase_item_id_marketplace_purchase_items_id_fk" FOREIGN KEY ("purchase_item_id") REFERENCES "public"."marketplace_purchase_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_earnings" ADD CONSTRAINT "marketplace_earnings_payout_id_payouts_id_fk" FOREIGN KEY ("payout_id") REFERENCES "public"."payouts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_purchase_items" ADD CONSTRAINT "marketplace_purchase_items_purchase_id_marketplace_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."marketplace_purchases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_purchase_items" ADD CONSTRAINT "marketplace_purchase_items_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_purchases" ADD CONSTRAINT "marketplace_purchases_buyer_organization_id_organizations_id_fk" FOREIGN KEY ("buyer_organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_purchases" ADD CONSTRAINT "marketplace_purchases_buyer_user_id_users_id_fk" FOREIGN KEY ("buyer_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_id_profiles_id_fk" FOREIGN KEY ("id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waitlist_activity_logs" ADD CONSTRAINT "waitlist_activity_logs_waitlist_user_id_waitlist_users_id_fk" FOREIGN KEY ("waitlist_user_id") REFERENCES "public"."waitlist_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waitlist_invitations" ADD CONSTRAINT "waitlist_invitations_waitlist_user_id_waitlist_users_id_fk" FOREIGN KEY ("waitlist_user_id") REFERENCES "public"."waitlist_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waitlist_referrals" ADD CONSTRAINT "waitlist_referrals_referrer_id_waitlist_users_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."waitlist_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waitlist_referrals" ADD CONSTRAINT "waitlist_referrals_referred_id_waitlist_users_id_fk" FOREIGN KEY ("referred_id") REFERENCES "public"."waitlist_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_admin_user_idx" ON "admin_audit_logs" USING btree ("admin_user_id");--> statement-breakpoint
CREATE INDEX "audit_target_idx" ON "admin_audit_logs" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "anonymized_flag_data_user_hash_idx" ON "anonymized_flag_data" USING btree ("user_hash");--> statement-breakpoint
CREATE INDEX "anonymized_flag_data_session_hash_idx" ON "anonymized_flag_data" USING btree ("session_hash");--> statement-breakpoint
CREATE INDEX "anonymized_flag_data_flagged_at_idx" ON "anonymized_flag_data" USING btree ("flagged_at");--> statement-breakpoint
CREATE INDEX "anonymized_flag_data_mode_idx" ON "anonymized_flag_data" USING btree ("mode");--> statement-breakpoint
CREATE INDEX "anonymized_flag_data_response_type_idx" ON "anonymized_flag_data" USING btree ("response_type");--> statement-breakpoint
CREATE INDEX "resonance_flag_analytics_period_type_idx" ON "resonance_flag_analytics" USING btree ("period_type");--> statement-breakpoint
CREATE INDEX "resonance_flag_analytics_period_idx" ON "resonance_flag_analytics" USING btree ("period");--> statement-breakpoint
CREATE INDEX "messages_chat_id_idx" ON "chat_messages" USING btree ("chat_id");--> statement-breakpoint
CREATE INDEX "chats_user_id_idx" ON "chats" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "chats_topic_id_idx" ON "chats" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "idx_conversation_states_chat_id" ON "conversation_states" USING btree ("chat_id");--> statement-breakpoint
CREATE INDEX "dar_user_id_idx" ON "data_access_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "dar_status_idx" ON "data_access_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "dar_created_at_idx" ON "data_access_requests" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "external_connections_user_id_idx" ON "external_connections" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "external_connections_source_name_idx" ON "external_connections" USING btree ("source_name");--> statement-breakpoint
CREATE INDEX "coherence_feedback_user_id_idx" ON "coherence_feedback" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "coherence_feedback_session_id_idx" ON "coherence_feedback" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "coherence_feedback_message_id_idx" ON "coherence_feedback" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "coherence_feedback_processed_at_idx" ON "coherence_feedback" USING btree ("processed_at");--> statement-breakpoint
CREATE INDEX "resonance_flags_user_id_idx" ON "resonance_flags" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "resonance_flags_session_id_idx" ON "resonance_flags" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "resonance_flags_flagged_interaction_id_idx" ON "resonance_flags" USING btree ("flagged_interaction_id");--> statement-breakpoint
CREATE INDEX "resonance_flags_client_timestamp_idx" ON "resonance_flags" USING btree ("client_timestamp");--> statement-breakpoint
CREATE INDEX "resonance_flags_processed_at_idx" ON "resonance_flags" USING btree ("processed_at");--> statement-breakpoint
CREATE INDEX "learning_updates_user_id_idx" ON "learning_updates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "learning_updates_feedback_id_idx" ON "learning_updates" USING btree ("feedback_id");--> statement-breakpoint
CREATE INDEX "access_log_purchase_idx" ON "marketplace_dataset_access_logs" USING btree ("purchase_id");--> statement-breakpoint
CREATE INDEX "access_log_accessor_idx" ON "marketplace_dataset_access_logs" USING btree ("accessor_identifier");--> statement-breakpoint
CREATE INDEX "earnings_pseudonym_idx" ON "marketplace_earnings" USING btree ("user_pseudonym");--> statement-breakpoint
CREATE INDEX "earnings_status_idx" ON "marketplace_earnings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "earnings_payout_idx" ON "marketplace_earnings" USING btree ("payout_id");--> statement-breakpoint
CREATE UNIQUE INDEX "purchase_question_idx" ON "marketplace_purchase_items" USING btree ("purchase_id","question_id");--> statement-breakpoint
CREATE INDEX "purchase_status_idx" ON "marketplace_purchases" USING btree ("status");--> statement-breakpoint
CREATE INDEX "purchase_buyer_org_idx" ON "marketplace_purchases" USING btree ("buyer_organization_id");--> statement-breakpoint
CREATE INDEX "purchase_buyer_user_idx" ON "marketplace_purchases" USING btree ("buyer_user_id");--> statement-breakpoint
CREATE INDEX "payouts_user_id_idx" ON "payouts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "payouts_status_idx" ON "payouts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_status_idx" ON "notifications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "questions_topic_id_idx" ON "questions" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "questions_status_idx" ON "questions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "questions_tags_idx" ON "questions" USING gin ("tags");--> statement-breakpoint
CREATE UNIQUE INDEX "responses_user_question_unique_idx" ON "survey_responses" USING btree ("user_id","question_id");--> statement-breakpoint
CREATE INDEX "responses_question_id_idx" ON "survey_responses" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "responses_user_id_idx" ON "survey_responses" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "topics_name_idx" ON "topics" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_pseudonym_idx" ON "profiles" USING btree ("pseudonym");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "waitlist_activity_logs_user_idx" ON "waitlist_activity_logs" USING btree ("waitlist_user_id");--> statement-breakpoint
CREATE INDEX "waitlist_activity_logs_action_idx" ON "waitlist_activity_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "waitlist_invitations_user_idx" ON "waitlist_invitations" USING btree ("waitlist_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "waitlist_invitations_code_idx" ON "waitlist_invitations" USING btree ("invitation_code");--> statement-breakpoint
CREATE INDEX "waitlist_referrals_referrer_idx" ON "waitlist_referrals" USING btree ("referrer_id");--> statement-breakpoint
CREATE INDEX "waitlist_referrals_referred_idx" ON "waitlist_referrals" USING btree ("referred_id");--> statement-breakpoint
CREATE UNIQUE INDEX "waitlist_users_email_idx" ON "waitlist_users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "waitlist_users_referral_code_idx" ON "waitlist_users" USING btree ("referral_code");--> statement-breakpoint
CREATE INDEX "waitlist_users_referred_by_code_idx" ON "waitlist_users" USING btree ("referred_by_code");