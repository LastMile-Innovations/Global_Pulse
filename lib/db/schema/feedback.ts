import { pgTable, uuid, varchar, text, timestamp, boolean, index } from "drizzle-orm/pg-core"

/**
 * Resonance Flags table - stores user feedback about interactions that didn't resonate
 */
export const resonanceFlags = pgTable(
  "resonance_flags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // Store Supabase user ID directly
    userId: uuid("user_id").notNull(),
    // Session ID when the flag was submitted
    sessionId: varchar("session_id", { length: 255 }).notNull(),
    // Interaction ID that was flagged
    flaggedInteractionId: varchar("flagged_interaction_id", { length: 255 }).notNull(),
    // Preceding interaction ID (for context)
    precedingInteractionId: varchar("preceding_interaction_id", { length: 255 }),
    // Engagement mode at time of flag
    modeAtTimeOfFlag: varchar("mode_at_time_of_flag", { length: 50 }).notNull(),
    // Response type at time of flag (LLM, Template, etc.)
    responseTypeAtTimeOfFlag: varchar("response_type_at_time_of_flag", { length: 100 }).notNull(),
    // Tags selected by the user
    selectedTags: text("selected_tags").array(),
    // Optional comment from the user
    optionalComment: text("optional_comment"),
    // Client-side timestamp when flag was submitted
    clientTimestamp: timestamp("client_timestamp", { withTimezone: true }).notNull(),
    // Server-side timestamp when flag was received
    serverTimestamp: timestamp("server_timestamp", { withTimezone: true }).defaultNow().notNull(),
    // Whether this flag has been reviewed
    reviewed: boolean("reviewed").default(false).notNull(),
    // Notes from review (internal use)
    reviewNotes: text("review_notes"),
    // When this flag was processed by the learning system
    processedAt: timestamp("processed_at", { withTimezone: true }),
  },
  (table) => ({
    userIdx: index("resonance_flags_user_id_idx").on(table.userId),
    sessionIdIdx: index("resonance_flags_session_id_idx").on(table.sessionId),
    flaggedInteractionIdIdx: index("resonance_flags_flagged_interaction_id_idx").on(table.flaggedInteractionId),
    clientTimestampIdx: index("resonance_flags_client_timestamp_idx").on(table.clientTimestamp),
    processedAtIdx: index("resonance_flags_processed_at_idx").on(table.processedAt),
  }),
)

/**
 * Coherence Feedback table - stores user feedback about message coherence
 */
export const coherenceFeedback = pgTable(
  "coherence_feedback",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // Store Supabase user ID directly
    userId: uuid("user_id").notNull(),
    sessionId: varchar("session_id", { length: 255 }).notNull(),
    messageId: varchar("message_id", { length: 255 }).notNull(),
    coherenceScore: varchar("coherence_score", { length: 20 }).notNull(), // e.g., 'coherent', 'incoherent', 'partially'
    feedback: text("feedback"), // Optional comment
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
  },
  (table) => ({
    userIdx: index("coherence_feedback_user_id_idx").on(table.userId),
    sessionIdIdx: index("coherence_feedback_session_id_idx").on(table.sessionId),
    messageIdIdx: index("coherence_feedback_message_id_idx").on(table.messageId),
    processedAtIdx: index("coherence_feedback_processed_at_idx").on(table.processedAt),
  }),
)
