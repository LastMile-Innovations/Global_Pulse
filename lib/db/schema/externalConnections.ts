import { pgTable, uuid, varchar, text, timestamp, index } from "drizzle-orm/pg-core"

export const externalConnections = pgTable(
  "external_connections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    sourceName: varchar("source_name", { length: 255 }).notNull(),
    encryptedRefreshToken: text("encrypted_refresh_token").notNull(),
    encryptedAccessToken: text("encrypted_access_token"),
    tokenExpiry: timestamp("token_expiry", { withTimezone: true }),
    status: varchar("status", { length: 20 }).default("disconnected").notNull(),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    errorMessage: text("error_message"),
    metadata: text("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("external_connections_user_id_idx").on(table.userId),
    sourceNameIdx: index("external_connections_source_name_idx").on(table.sourceName),
  }),
)
