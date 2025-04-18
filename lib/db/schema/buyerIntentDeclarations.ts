import { pgTable, uuid, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core"
// import { users } from "./users" // Removed import

export const buyerIntentDeclarations = pgTable("buyer_intent_declarations", {
  id: uuid("id").defaultRandom().primaryKey(),
  // Store Supabase user ID directly
  userId: uuid("user_id").notNull(), 
  intentType: varchar("intent_type", { length: 50 }).notNull(), // e.g., 'purchase', 'research', 'partnership'
  intentDescription: text("intent_description").notNull(),
  productCategory: varchar("product_category", { length: 100 }),
  budget: varchar("budget", { length: 50 }),
  timeframe: varchar("timeframe", { length: 50 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

// Removed relations definition
// import { relations } from 'drizzle-orm'
// export const buyerIntentDeclarationsRelations = relations(buyerIntentDeclarations, ({ one }) => ({
//   user: one(users, {
//     fields: [buyerIntentDeclarations.userId],
//     references: [users.id],
//   }),
// }))
