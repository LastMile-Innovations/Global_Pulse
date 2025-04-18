import { pgTable, uuid, varchar, text, boolean, timestamp, index } from "drizzle-orm/pg-core"

export const dataAccessRequests = pgTable(
  "data_access_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    contactName: varchar("contact_name", { length: 255 }).notNull(),
    organizationName: varchar("organization_name", { length: 255 }).notNull(),
    contactEmail: varchar("contact_email", { length: 255 }).notNull(),
    contactPhone: varchar("contact_phone", { length: 50 }),
    intentDeclaration: text("intent_declaration").notNull(),
    policyAcknowledged: boolean("policy_acknowledged").notNull(),
    status: varchar("status", { length: 20 }).default("pending").notNull(),
    reviewNotes: text("review_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("dar_user_id_idx").on(table.userId),
    statusIdx: index("dar_status_idx").on(table.status),
    createdAtIdx: index("dar_created_at_idx").on(table.createdAt),
  }),
)
