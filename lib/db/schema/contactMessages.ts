import { pgTable, uuid, varchar, text, timestamp, index, pgEnum } from "drizzle-orm/pg-core"

// Define contact message category enum
export const contactCategoryEnum = pgEnum('contact_category', [
  'general',
  'support',
  'feedback',
  'privacy', 
  'security',
  'ethics',
  'feature_request',
  'bug_report',
  'other'
])

// Define contact message status enum
export const contactStatusEnum = pgEnum('contact_status', [
  'new',
  'in_progress',
  'responded',
  'closed',
  'spam'
])

/**
 * Contact Messages table - stores messages from the contact form
 */
export const contactMessages = pgTable(
  "contact_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // User ID if signed in (optional)
    userId: uuid("user_id"),
    // Contact name
    name: varchar("name", { length: 255 }).notNull(),
    // Contact email
    email: varchar("email", { length: 255 }).notNull(),
    // Message subject
    subject: varchar("subject", { length: 255 }).notNull(),
    // Message category
    category: contactCategoryEnum("category").notNull(),
    // Message body
    message: text("message").notNull(),
    // Message status
    status: contactStatusEnum("status").default("new").notNull(),
    // Optional notes from the admin (internal use)
    adminNotes: text("admin_notes"),
    // IP address for spam protection
    ipAddress: varchar("ip_address", { length: 50 }),
    // When the admin responded
    respondedAt: timestamp("responded_at", { withTimezone: true }),
    // Server-side timestamp when message was received
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    // When this message was updated
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => {
    return {
      userIdIdx: index("contact_user_id_idx").on(table.userId),
      statusIdx: index("contact_status_idx").on(table.status),
      categoryIdx: index("contact_category_idx").on(table.category),
      createdAtIdx: index("contact_created_at_idx").on(table.createdAt),
    }
  }
) 