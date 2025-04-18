import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  varchar,
  uniqueIndex,
  index,
  jsonb,
  uuid,
  numeric,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
// import { users } from './users'; // Removed import
import { questions } from './surveys'; // Assumes surveys.ts exists
// Import profiles if needed for pseudonym relation, or handle via direct UUID match
import { profiles } from './users'; // Keep profiles import for userPseudonym

// Enums
export const purchaseStatusEnum = pgEnum('purchase_status', [
  'pending',
  'awaiting_payment',
  'processing',
  'completed',
  'failed',
  'refunded',
  'partially_refunded',
  'cancelled',
  'disputed'
]);

export const earningStatusEnum = pgEnum('earning_status', [
  'pending',
  'available',
  'requested',
  'processing',
  'paid_out',
  'failed',
  'cancelled',
  'on_hold',
  'expired'
]);

export const payoutStatusEnum = pgEnum('payout_status', [
  'requested',
  'approved',
  'processing',
  'completed',
  'failed',
  'cancelled',
  'on_hold',
  'rejected',
  'scheduled'
]);

// --- Organizations Table ---
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
});

// --- Marketplace Tables ---
export const marketplace_purchases = pgTable('marketplace_purchases', {
  id: uuid('id').primaryKey().defaultRandom(),
  buyerIdentifier: text('buyer_identifier').notNull(), // Simple identifier for P1
  buyerOrganizationId: uuid('buyer_organization_id').references(() => organizations.id, { onDelete: 'set null' }),
  // Store Supabase user ID directly
  buyerUserId: uuid('buyer_user_id'), // Removed .references and .notNull (can be null if buyer is org only)
  purchaseDate: timestamp('purchase_date', { withTimezone: true }).defaultNow().notNull(),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('USD').notNull(),
  status: text('status', { enum: [
    'pending',
    'awaiting_payment',
    'processing',
    'completed',
    'failed',
    'refunded',
    'partially_refunded',
    'cancelled',
    'disputed'
  ] }).default('pending').notNull(),
  paymentProviderRef: text('payment_provider_ref'),
  datasetAccessInfo: jsonb('dataset_access_info'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
}, (table) => ({
  statusIdx: index('purchase_status_idx').on(table.status),
  buyerOrgIdx: index('purchase_buyer_org_idx').on(table.buyerOrganizationId),
  buyerUserIdx: index('purchase_buyer_user_idx').on(table.buyerUserId),
}));

export const marketplace_purchase_items = pgTable('marketplace_purchase_items', {
  id: serial('id').primaryKey(),
  purchaseId: uuid('purchase_id').notNull().references(() => marketplace_purchases.id, { onDelete: 'cascade' }),
  questionId: integer('question_id').notNull().references(() => questions.id, { onDelete: 'restrict' }), // Prevent deleting questions included in purchases
  answerCountRequested: integer('answer_count_requested').notNull(),
  pricePerAnswer: numeric('price_per_answer', { precision: 10, scale: 4 }).notNull(), // Higher precision for unit price
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  purchaseQuestionIdx: uniqueIndex('purchase_question_idx').on(table.purchaseId, table.questionId),
}));

// --- Payouts Table (P3 Marketplace Feature) ---
export const payouts = pgTable('payouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  // Store Supabase user ID directly
  userId: uuid('user_id').notNull(), 
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('USD').notNull(),
  status: text('status', { enum: [
    'requested',
    'approved',
    'processing',
    'completed',
    'failed',
    'cancelled',
    'on_hold',
    'rejected',
    'scheduled'
  ] }).default('requested').notNull(),
  payoutMethodInfo: jsonb('payout_method_info'),
  providerReference: text('provider_reference'),
  requestedAt: timestamp('requested_at', { withTimezone: true }).defaultNow().notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
}, (table) => ({
  userIdx: index('payouts_user_id_idx').on(table.userId),
  statusIdx: index('payouts_status_idx').on(table.status),
}));

export const marketplace_earnings = pgTable('marketplace_earnings', {
  id: serial('id').primaryKey(),
  // Keep reference to profiles.pseudonym
  userPseudonym: uuid('user_pseudonym').notNull(), //.references(() => profiles.id), // FK to profiles.pseudonym not directly possible, match by value
  purchaseItemId: integer('purchase_item_id').notNull().references(() => marketplace_purchase_items.id, { onDelete: 'cascade' }),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('USD').notNull(),
  status: text('status', { enum: [
    'pending',
    'available',
    'requested',
    'processing',
    'paid_out',
    'failed',
    'cancelled',
    'on_hold',
    'expired'
  ] }).default('pending').notNull(),
  payoutId: uuid('payout_id').references(() => payouts.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }), // When status moved from pending
}, (table) => ({
  pseudonymIdx: index('earnings_pseudonym_idx').on(table.userPseudonym), // Index remains useful
  statusIdx: index('earnings_status_idx').on(table.status), 
  payoutIdx: index('earnings_payout_idx').on(table.payoutId),
}));

// --- Marketplace Pricing Rules Table ---
export const marketplace_pricing_rules = pgTable('marketplace_pricing_rules', {
  id: serial('id').primaryKey(),
  ruleName: text('rule_name').notNull().unique(), // e.g., "Standard Per Answer", "Tier 1"
  pricePerAnswer: numeric('price_per_answer', { precision: 10, scale: 4 }).notNull(),
  currency: text('currency').notNull().default('USD'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
});

// --- Marketplace Dataset Access Logs Table ---
export const marketplace_dataset_access_logs = pgTable('marketplace_dataset_access_logs', {
  id: serial('id').primaryKey(),
  purchaseId: uuid('purchase_id').notNull().references(() => marketplace_purchases.id, { onDelete: 'cascade' }),
  accessorIdentifier: text('accessor_identifier').notNull(), // Could be buyer org ID, user ID, or API key ID
  accessTimestamp: timestamp('access_timestamp', { withTimezone: true }).defaultNow().notNull(),
  ipAddress: text('ip_address'), // Store requesting IP if available/relevant
  details: jsonb('details'), // e.g., Format downloaded (CSV/JSON)
}, (table) => ({
  purchaseIdx: index('access_log_purchase_idx').on(table.purchaseId),
  accessorIdx: index('access_log_accessor_idx').on(table.accessorIdentifier),
}));


// --- Relations ---
export const organizationsRelations = relations(organizations, ({ many }) => ({
  purchases: many(marketplace_purchases),
}));

// payoutsRelations: Remove user relation
export const payoutsRelations = relations(payouts, ({ many }) => ({
  // user: one(users, { fields: [payouts.userId], references: [users.id] }),
  earnings: many(marketplace_earnings),
}));

export const marketplacePricingRulesRelations = relations(marketplace_pricing_rules, ({ }) => ({
  // No relations needed yet
}));

export const marketplaceDatasetAccessLogsRelations = relations(marketplace_dataset_access_logs, ({ one }) => ({
  purchase: one(marketplace_purchases, { fields: [marketplace_dataset_access_logs.purchaseId], references: [marketplace_purchases.id] }),
}));

// marketplacePurchasesRelations: Remove buyerUser relation
export const marketplacePurchasesRelations = relations(marketplace_purchases, ({ one, many }) => ({
  items: many(marketplace_purchase_items),
  buyerOrganization: one(organizations, { fields: [marketplace_purchases.buyerOrganizationId], references: [organizations.id] }),
  // buyerUser: one(users, { fields: [marketplace_purchases.buyerUserId], references: [users.id] }),
  accessLogs: many(marketplace_dataset_access_logs),
}));

export const marketplacePurchaseItemsRelations = relations(marketplace_purchase_items, ({ one, many }) => ({
  purchase: one(marketplace_purchases, { fields: [marketplace_purchase_items.purchaseId], references: [marketplace_purchases.id] }),
  question: one(questions, { fields: [marketplace_purchase_items.questionId], references: [questions.id] }),
  earnings: many(marketplace_earnings),
}));

export const marketplaceEarningsRelations = relations(marketplace_earnings, ({ one }) => ({
  purchaseItem: one(marketplace_purchase_items, { fields: [marketplace_earnings.purchaseItemId], references: [marketplace_purchase_items.id] }),
  payout: one(payouts, { fields: [marketplace_earnings.payoutId], references: [payouts.id] }),
  // We don't define a relation back to profiles via pseudonym here, 
  // it's handled by joining on the userPseudonym value where needed.
})); 