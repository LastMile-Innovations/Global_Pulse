// lib/db/schema.ts
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
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';

// Define Enums for Status fields - improves type safety and consistency
export const userRoleEnum = pgEnum('user_role', ['user', 'admin', 'moderator', 'analyst', 'support', 'guest']);

export const questionTypeEnum = pgEnum('question_type', [
  'multiple-choice',
  'slider-scale', 
  'simple-buttons', // Renamed from 'buttons' for clarity
  'sentiment-reaction', // Added based on usage
  'priority-ranking', // Added based on usage
  'open-ended',
  'matrix-grid',
  'image-choice',
  'nps',
  'date-time',
  'dropdown'
]);

export const responseSourceEnum = pgEnum('response_source', [
  'chat',
  'survey_feed',
  'embedded_widget',
  'email_campaign',
  'api',
  'mobile_app',
  'import'
]);

export const questionStatusEnum = pgEnum('question_status', [
  'draft',
  'review',
  'active',
  'paused',
  'archived',
  'flagged',
  'deleted'
]);

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

// Define conversation question type enum for alternating question types
export const conversationQuestionTypeEnum = pgEnum('conversation_question_type', [
  'structured',
  'open-ended'
]);

export const notificationTypeEnum = pgEnum('notification_type', [
  'info',
  'warning',
  'error',
  'success',
  'payout',
  'new_feature',
  'survey_completion',
  'earnings_update',
  'system_maintenance',
  'account_security',
  'consent_update'
]);

export const notificationStatusEnum = pgEnum('notification_status', [
  'unread',
  'read',
  'archived',
  'deleted',
  'actioned'
]);

// --- Users & Auth ---
// Represents the core user identity, mirroring Supabase Auth users.
export const users = pgTable('users', {
  id: uuid('id').primaryKey().references(() => profiles.id, { onDelete: 'cascade' }),
  email: text('email').notNull().unique(),
  // Use text with enum values for compatibility
  role: text('role', { enum: ['user', 'admin', 'moderator', 'analyst', 'support', 'guest'] }).default('user').notNull(),
  // Note: User onboarding flags (completed_first_chat, etc.) are stored in the profiles table
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
}, (table) => ({
  emailIdx: uniqueIndex('users_email_idx').on(table.email),
}));

// --- Chats ---
export const chats = pgTable('chats', {
  id: varchar('id', { length: 21 }).primaryKey(), // Match nanoid length if used
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').default('New Conversation').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  topicId: varchar('topic_id', { length: 50 }).references(() => topics.id, { onDelete: 'set null' }), // Optional FK to topics
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
}, (table) => ({
  userIdx: index('chats_user_id_idx').on(table.userId),
  topicIdx: index('chats_topic_id_idx').on(table.topicId), // Index for filtering chats by topic
}));

export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  chatId: varchar('chat_id', { length: 21 }).notNull().references(() => chats.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['user', 'assistant', 'system', 'tool'] }).notNull(),
  content: text('content').notNull(), // Store primary text content for simplicity/indexing
  toolCalls: jsonb('tool_calls'), // JSONB array of StoredToolCall objects
  toolResults: jsonb('tool_results'), // JSONB array of StoredToolResult objects
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  chatIdIdx: index('messages_chat_id_idx').on(table.chatId),
}));

// --- Conversation States ---
// Tracks the state of conversations for alternating question types
export const conversation_states = pgTable('conversation_states', {
  chatId: varchar('chat_id', { length: 50 }).primaryKey().references(() => chats.id, { onDelete: 'cascade' }),
  // Keep as varchar for now to avoid migration issues, but we'll treat it as the enum type in our code
  lastQuestionType: varchar('last_question_type', { length: 20 }).notNull().default('open-ended'),
  questionCount: integer('question_count').notNull().default(0),
  structuredQuestionCount: integer('structured_question_count').notNull().default(0),
  openEndedQuestionCount: integer('open_ended_question_count').notNull().default(0),
  topicFocus: varchar('topic_focus', { length: 100 }),
  lastQuestionTimestamp: numeric('last_question_timestamp').notNull().default(
    sql`extract(epoch from now()) * 1000`
  ),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
}, (table) => ({
  chatIdIdx: index('idx_conversation_states_chat_id').on(table.chatId),
}));

// --- Surveys ---
export const topics = pgTable('topics', {
  id: varchar('id', { length: 50 }).primaryKey(), // Use slug or ID
  name: text('name').notNull().unique(),
  description: text('description'),
  engagementCount: integer('engagement_count').default(0).notNull(),
}, (table) => ({
  nameIdx: uniqueIndex('topics_name_idx').on(table.name),
}));

export const questions = pgTable('questions', {
  id: serial('id').primaryKey(),
  text: text('text').notNull(),
  // Use text with enum values for compatibility
  type: text('type', { enum: [
    'multiple-choice',
    'slider-scale', 
    'simple-buttons',
    'sentiment-reaction',
    'priority-ranking',
    'open-ended',
    'matrix-grid',
    'image-choice',
    'nps',
    'date-time',
    'dropdown'
  ] }).notNull(),
  status: text('status', { enum: [
    'draft',
    'review',
    'active',
    'paused',
    'archived',
    'flagged',
    'deleted'
  ] }).default('active').notNull(),
  parameters: jsonb('parameters').notNull(), // Store type-specific parameters (MultipleChoiceParams, SliderScaleParams, etc.)
  topicId: varchar('topic_id', { length: 50 }).references(() => topics.id, { onDelete: 'set null' }),
  tags: text('tags').array(), // Array of string tags
  isGenerated: boolean('is_generated').default(false).notNull(), // Added based on usage
  generationContext: text('generation_context'), // Added based on usage
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
}, (table) => ({
  topicIdx: index('questions_topic_id_idx').on(table.topicId),
  statusIdx: index('questions_status_idx').on(table.status),
  tagsIdx: index('questions_tags_idx').using('gin', table.tags), // GIN index for array searching
}));

export const surveyResponses = pgTable('survey_responses', {
  id: varchar('id', { length: 21 }).primaryKey(), // Match nanoid length
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  questionId: integer('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  optionId: varchar('option_id', { length: 50 }), // For multiple-choice, simple-buttons, sentiment-reaction
  numericValue: numeric('numeric_value'), // For slider-scale
  textValue: text('text_value'), // For open-ended, priority-ranking (JSON string), etc.
  // Use text with enum values for compatibility
  source: text('source', { enum: [
    'chat',
    'survey_feed',
    'embedded_widget',
    'email_campaign',
    'api',
    'mobile_app',
    'import'
  ] }).default('chat').notNull(),
  chatId: varchar('chat_id', { length: 21 }).references(() => chats.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  // Ensure a user answers a specific question only ONCE regardless of source
  userQuestionUniqueIdx: uniqueIndex('responses_user_question_unique_idx').on(table.userId, table.questionId),
  questionIdx: index('responses_question_id_idx').on(table.questionId),
  userIdx: index('responses_user_id_idx').on(table.userId), // Add index for user-specific queries
}));

// --- Profiles ---
// Stores user-specific attributes, settings, and flags. Linked 1-to-1 with users.
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // Matches Supabase auth user ID
  firstName: text('first_name'),
  lastName: text('last_name'),
  avatarUrl: text('avatar_url'), // Added common profile field
  // Marketplace Consent: Critical flag controlled by user settings.
  marketplaceConsentStructuredAnswers: boolean('marketplace_consent_structured_answers').default(false).notNull(),
  // Anonymization: Unique, non-reversible identifier for marketplace participation. Generated on creation.
  pseudonym: uuid('pseudonym').defaultRandom().notNull().unique(),
  // Onboarding Tracking Flags: Used for dashboard checklists, etc.
  completedFirstChat: boolean('completed_first_chat').default(false).notNull(),
  completedFirstSurvey: boolean('completed_first_survey').default(false).notNull(),
  viewedExplore: boolean('viewed_explore').default(false).notNull(),
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
}, (table) => ({
  pseudonymIdx: uniqueIndex('profiles_pseudonym_idx').on(table.pseudonym), // Index for joining earnings
}));

// --- Define Relations ---
export const usersRelations = relations(users, ({ many }) => ({
  chats: many(chats),
  surveyResponses: many(surveyResponses),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
  user: one(users, { fields: [chats.userId], references: [users.id] }),
  messages: many(chatMessages),
  surveyResponses: many(surveyResponses), // Answers given within this chat
  conversationState: one(conversation_states, { fields: [chats.id], references: [conversation_states.chatId] }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  chat: one(chats, { fields: [chatMessages.chatId], references: [chats.id] }),
}));

export const topicsRelations = relations(topics, ({ many }) => ({
  questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  topic: one(topics, { fields: [questions.topicId], references: [topics.id] }),
  responses: many(surveyResponses),
}));

export const surveyResponsesRelations = relations(surveyResponses, ({ one }) => ({
  user: one(users, { fields: [surveyResponses.userId], references: [users.id] }),
  question: one(questions, { fields: [surveyResponses.questionId], references: [questions.id] }),
  chat: one(chats, { fields: [surveyResponses.chatId], references: [chats.id] }),
}));

// --- Organizations Table ---
// Optional: Represents organizations or individuals buying data. Links to users table if buyers can also be participants.
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  // Could link to a user who manages the org account
  // primaryUserId: uuid('primary_user_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
});

// --- Marketplace Tables ---
// Tables related to the Insights Marketplace where anonymized data can be purchased
// and contributing users receive a share of the revenue.

export const marketplace_purchases = pgTable('marketplace_purchases', {
  id: uuid('id').primaryKey().defaultRandom(),
  buyerIdentifier: text('buyer_identifier').notNull(), // Simple identifier for P1
  buyerOrganizationId: uuid('buyer_organization_id').references(() => organizations.id, { onDelete: 'set null' }),
  buyerUserId: uuid('buyer_user_id').references(() => users.id, { onDelete: 'set null' }),
  purchaseDate: timestamp('purchase_date', { withTimezone: true }).defaultNow().notNull(),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('USD').notNull(),
  // Use text with enum values for compatibility
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
// Tracks user requests to withdraw their available marketplace earnings.
export const payouts = pgTable('payouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('USD').notNull(),
  // Use text with enum values for compatibility
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
  userPseudonym: uuid('user_pseudonym').notNull(), // Matches profiles.pseudonym value
  purchaseItemId: integer('purchase_item_id').notNull().references(() => marketplace_purchase_items.id, { onDelete: 'cascade' }),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('USD').notNull(),
  // Use text with enum values for compatibility
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
  pseudonymIdx: index('earnings_pseudonym_idx').on(table.userPseudonym), // Essential for user earnings lookup
  statusIdx: index('earnings_status_idx').on(table.status), // For querying available/pending earnings
  payoutIdx: index('earnings_payout_idx').on(table.payoutId),
}));

// --- Notifications Table ---
// For potential future in-app notifications.
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  // Use text with enum values for compatibility
  type: text('type', { enum: [
    'info',
    'warning',
    'error',
    'success',
    'payout',
    'new_feature',
    'survey_completion',
    'earnings_update',
    'system_maintenance',
    'account_security',
    'consent_update'
  ] }).default('info').notNull(),
  // Use text with enum values for compatibility
  status: text('status', { enum: [
    'unread',
    'read',
    'archived',
    'deleted',
    'actioned'
  ] }).default('unread').notNull(),
  content: text('content').notNull(),
  link: text('link'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdx: index('notifications_user_id_idx').on(table.userId),
  statusIdx: index('notifications_status_idx').on(table.status),
}));

// --- Admin Audit Logs Table ---
// Basic table for logging administrative actions.
export const admin_audit_logs = pgTable('admin_audit_logs', {
  id: serial('id').primaryKey(),
  adminUserId: uuid('admin_user_id').notNull().references(() => users.id, { onDelete: 'set null' }), // User performing action
  action: text('action').notNull(), // Description of action (e.g., 'updated_topic', 'processed_payout')
  targetType: text('target_type'), // e.g., 'topic', 'user', 'payout'
  targetId: text('target_id'), // ID of the entity affected
  details: jsonb('details'), // Additional context/changes
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  adminUserIdx: index('audit_admin_user_idx').on(table.adminUserId),
  targetIdx: index('audit_target_idx').on(table.targetType, table.targetId),
}));

// --- Marketplace Pricing Rules Table ---
// Optional: For defining pricing logic if it's complex or changes.
export const marketplace_pricing_rules = pgTable('marketplace_pricing_rules', {
  id: serial('id').primaryKey(),
  ruleName: text('rule_name').notNull().unique(), // e.g., "Standard Per Answer", "Tier 1"
  pricePerAnswer: numeric('price_per_answer', { precision: 10, scale: 4 }).notNull(),
  currency: text('currency').notNull().default('USD'),
  // Add criteria if needed, e.g., based on question type, topic, etc.
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
});

// --- Marketplace Dataset Access Logs Table ---
// Optional: For auditing buyer access to purchased data.
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

// --- Add Relations for New Tables ---
export const organizationsRelations = relations(organizations, ({ many }) => ({
  purchases: many(marketplace_purchases),
}));

export const payoutsRelations = relations(payouts, ({ one, many }) => ({
  user: one(users, { fields: [payouts.userId], references: [users.id] }),
  earnings: many(marketplace_earnings),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const adminAuditLogsRelations = relations(admin_audit_logs, ({ one }) => ({
  adminUser: one(users, { fields: [admin_audit_logs.adminUserId], references: [users.id] }),
}));

export const marketplacePricingRulesRelations = relations(marketplace_pricing_rules, ({ }) => ({
  // No relations needed yet
}));

export const marketplaceDatasetAccessLogsRelations = relations(marketplace_dataset_access_logs, ({ one }) => ({
  purchase: one(marketplace_purchases, { fields: [marketplace_dataset_access_logs.purchaseId], references: [marketplace_purchases.id] }),
}));

// Update marketplace relations to include new references
export const marketplacePurchasesRelations = relations(marketplace_purchases, ({ one, many }) => ({
  items: many(marketplace_purchase_items),
  buyerOrganization: one(organizations, { fields: [marketplace_purchases.buyerOrganizationId], references: [organizations.id] }),
  buyerUser: one(users, { fields: [marketplace_purchases.buyerUserId], references: [users.id] }),
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
}));

// Conversation states relations
export const conversationStatesRelations = relations(conversation_states, ({ one }) => ({
  chat: one(chats, { fields: [conversation_states.chatId], references: [chats.id] }),
}));

// --- Export Combined Schema ---
export const schema = {
  // Tables
  users,
  chats,
  chatMessages,
  conversation_states,
  topics,
  questions,
  surveyResponses,
  profiles,
  organizations,
  marketplace_purchases,
  marketplace_purchase_items,
  marketplace_earnings,
  payouts,
  notifications,
  admin_audit_logs,
  marketplace_pricing_rules,
  marketplace_dataset_access_logs,
  
  // Relations are implicitly included by Drizzle when passing this object
  usersRelations,
  chatsRelations,
  chatMessagesRelations,
  topicsRelations,
  questionsRelations,
  surveyResponsesRelations,
  organizationsRelations,
  payoutsRelations,
  notificationsRelations,
  adminAuditLogsRelations,
  marketplacePricingRulesRelations,
  marketplaceDatasetAccessLogsRelations,
  // Enhanced marketplace relations with all references
  marketplacePurchasesRelations,
  marketplacePurchaseItemsRelations,
  marketplaceEarningsRelations,
  conversationStatesRelations,
};
