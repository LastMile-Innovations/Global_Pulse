CREATE TABLE "marketplace_earnings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_pseudonym" uuid NOT NULL,
	"purchase_item_id" integer NOT NULL,
	"amount" numeric(10, 4) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone
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
	"purchase_date" timestamp with time zone DEFAULT now() NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"status" text DEFAULT 'processing' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "topic_id" varchar(50);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "marketplace_consent_structured_answers" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "pseudonym" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "completed_first_chat" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "completed_first_survey" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "viewed_explore" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "marketplace_earnings" ADD CONSTRAINT "marketplace_earnings_purchase_item_id_marketplace_purchase_items_id_fk" FOREIGN KEY ("purchase_item_id") REFERENCES "public"."marketplace_purchase_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_purchase_items" ADD CONSTRAINT "marketplace_purchase_items_purchase_id_marketplace_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."marketplace_purchases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_purchase_items" ADD CONSTRAINT "marketplace_purchase_items_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "earnings_pseudonym_idx" ON "marketplace_earnings" USING btree ("user_pseudonym");--> statement-breakpoint
CREATE INDEX "earnings_status_idx" ON "marketplace_earnings" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "purchase_question_idx" ON "marketplace_purchase_items" USING btree ("purchase_id","question_id");--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chats_topic_id_idx" ON "chats" USING btree ("topic_id");--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "full_name";--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_pseudonym_unique" UNIQUE("pseudonym");