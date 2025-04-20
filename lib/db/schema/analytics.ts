import { pgTable, uuid, varchar, text, timestamp, integer, jsonb, index } from "drizzle-orm/pg-core"

// Table for storing aggregated flag analytics
export const resonanceFlagAnalytics = pgTable(
  "resonance_flag_analytics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // Time period this record represents (daily, weekly, monthly)
    periodType: varchar("period_type", { length: 20 }).notNull(),
    // The specific period (e.g., "2023-04-16" for daily, "2023-W16" for weekly)
    period: varchar("period", { length: 50 }).notNull(),
    // Total count of flags in this period
    totalFlags: integer("total_flags").notNull(),
    // Distribution of tags (JSON object with tag counts)
    tagDistribution: jsonb("tag_distribution").notNull(),
    // Distribution by mode (JSON object with mode counts)
    modeDistribution: jsonb("mode_distribution").notNull(),
    // Distribution by response type (JSON object with response type counts)
    responseTypeDistribution: jsonb("response_type_distribution").notNull(),
    // V1 Integrity: Fit feedback counts
    analysis_fit_yes_count: integer("analysis_fit_yes_count").default(0).notNull(),
    analysis_fit_no_count: integer("analysis_fit_no_count").default(0).notNull(),
    // Timestamp when this record was created/updated
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => {
    return {
      periodTypeIdx: index("resonance_flag_analytics_period_type_idx").on(table.periodType),
      periodIdx: index("resonance_flag_analytics_period_idx").on(table.period),
    }
  },
)

// Table for storing anonymized individual flag data for deeper analysis
export const anonymizedFlagData = pgTable(
  "anonymized_flag_data",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // Hashed user ID (one-way hash for privacy)
    userHash: varchar("user_hash", { length: 64 }).notNull(),
    // Hashed session ID (one-way hash for privacy)
    sessionHash: varchar("session_hash", { length: 64 }).notNull(),
    // When the flag was created
    flaggedAt: timestamp("flagged_at", { withTimezone: true }).notNull(),
    // Mode at time of flag
    mode: varchar("mode", { length: 50 }).notNull(),
    // Response type at time of flag
    responseType: varchar("response_type", { length: 50 }).notNull(),
    // Selected tags (array)
    selectedTags: text("selected_tags").array(),
    // Comment length (not the actual comment for privacy)
    commentLength: integer("comment_length"),
    // Time since session start (in seconds)
    timeSinceSessionStart: integer("time_since_session_start"),
    // Flag sequence number in session
    flagSequenceInSession: integer("flag_sequence_in_session"),
    // Created timestamp
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => {
    return {
      userHashIdx: index("anonymized_flag_data_user_hash_idx").on(table.userHash),
      sessionHashIdx: index("anonymized_flag_data_session_hash_idx").on(table.sessionHash),
      flaggedAtIdx: index("anonymized_flag_data_flagged_at_idx").on(table.flaggedAt),
      modeIdx: index("anonymized_flag_data_mode_idx").on(table.mode),
      responseTypeIdx: index("anonymized_flag_data_response_type_idx").on(table.responseType),
    }
  },
)
