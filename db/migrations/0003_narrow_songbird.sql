CREATE TYPE "public"."conversation_question_type" AS ENUM('structured', 'open-ended');--> statement-breakpoint
CREATE TABLE "conversation_states" (
	"chat_id" varchar(50) PRIMARY KEY NOT NULL,
	"last_question_type" "conversation_question_type" DEFAULT 'open-ended' NOT NULL,
	"question_count" integer DEFAULT 0 NOT NULL,
	"structured_question_count" integer DEFAULT 0 NOT NULL,
	"open_ended_question_count" integer DEFAULT 0 NOT NULL,
	"topic_focus" varchar(100),
	"last_question_timestamp" numeric DEFAULT extract(epoch from now()) * 1000 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "parameters" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "survey_responses" ALTER COLUMN "option_id" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "survey_responses" ALTER COLUMN "numeric_value" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "survey_responses" ALTER COLUMN "source" SET DEFAULT 'chat';--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "is_generated" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "generation_context" text;--> statement-breakpoint
ALTER TABLE "conversation_states" ADD CONSTRAINT "conversation_states_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_conversation_states_chat_id" ON "conversation_states" USING btree ("chat_id");--> statement-breakpoint
ALTER TABLE "public"."questions" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."question_type";--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('multiple-choice', 'slider-scale', 'simple-buttons', 'sentiment-reaction', 'priority-ranking', 'open-ended', 'matrix-grid', 'image-choice', 'nps', 'date-time', 'dropdown');--> statement-breakpoint
ALTER TABLE "public"."questions" ALTER COLUMN "type" SET DATA TYPE "public"."question_type" USING "type"::"public"."question_type";