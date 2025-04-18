ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
--> statement-breakpoint
--> statement-breakpoint
--> statement-breakpoint
--> statement-breakpoint
--> statement-breakpoint
--> statement-breakpoint
--> statement-breakpoint
--> statement-breakpoint
--> statement-breakpoint
--> statement-breakpoint
ALTER TABLE "learning_updates" ADD CONSTRAINT "learning_updates_feedback_id_coherence_feedback_id_fk" FOREIGN KEY ("feedback_id") REFERENCES "public"."coherence_feedback"("id") ON DELETE no action ON UPDATE no action;