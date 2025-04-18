import { pgTable, uuid, varchar, text, timestamp, numeric, index } from "drizzle-orm/pg-core"
import { coherenceFeedback } from "./feedback" // Import feedback table for FK
// import { users } from "./users" // Removed import

/**
 * Learning Updates table - tracks changes made based on feedback
 */
export const learningUpdates = pgTable(
  "learning_updates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // Link to the specific feedback that triggered this update
    feedbackId: uuid("feedback_id")
      .references(() => coherenceFeedback.id) // Example: linking to coherenceFeedback
      .notNull(),
    // Store Supabase user ID directly (user whose feedback led to the update)
    userId: uuid("user_id").notNull(), 
    // ID of the item/attachment/node affected by the update
    attachmentId: varchar("attachment_id", { length: 255 }).notNull(),
    // Property that was changed (e.g., 'coherence_score', 'relevance')
    propertyChanged: varchar("property_changed", { length: 50 }).notNull(),
    // Value before the update
    oldValue: numeric("old_value").notNull(),
    // Value after the update
    newValue: numeric("new_value").notNull(),
    // Change delta
    delta: numeric("delta").notNull(),
    // Rule or process that applied the update
    ruleApplied: varchar("rule_applied", { length: 100 }).notNull(),
    // Timestamp of the update
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("learning_updates_user_id_idx").on(table.userId),
    feedbackIdIdx: index("learning_updates_feedback_id_idx").on(table.feedbackId),
    // Add other indexes as needed, e.g., on attachmentId or propertyChanged
  }),
)

// Removed relations as they depended on the users table
// import { relations } from 'drizzle-orm'

// export const learningUpdatesRelations = relations(learningUpdates, ({ one }) => ({
//   user: one(users, {
//     fields: [learningUpdates.userId],
//     references: [users.id],
//   }),
//   // Assuming feedback relation links to coherenceFeedback for this example
//   feedback: one(coherenceFeedback, {
//     fields: [learningUpdates.feedbackId],
//     references: [coherenceFeedback.id],
//   }),
// }))
