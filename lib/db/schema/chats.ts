import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  varchar,
  index,
  jsonb,
  uuid,
  numeric,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
// import { users } from './users'; // Removed import for users
import { topics } from './surveys'; // Assume surveys.ts exists or will be created
import { surveyResponses } from './surveys'; // Assume surveys.ts exists or will be created

// Define conversation question type enum for alternating question types
export const conversationQuestionTypeEnum = pgEnum('conversation_question_type', [
  'structured',
  'open-ended'
]);

// --- Chats ---
export const chats = pgTable('chats', {
  id: varchar('id', { length: 21 }).primaryKey(), // Match nanoid length if used
  // Store Supabase user ID directly, no FK constraint to internal table
  userId: uuid('user_id').notNull(), 
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
  // Preference ratio for balancing structured vs open-ended questions (0-1)
  preferenceRatio: numeric('preference_ratio').default('0.5').notNull(),
  topicFocus: varchar('topic_focus', { length: 100 }),
  lastQuestionTimestamp: numeric('last_question_timestamp').notNull().default(
    sql`extract(epoch from now()) * 1000`
  ),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
}, (table) => ({
  chatIdIdx: index('idx_conversation_states_chat_id').on(table.chatId),
}));


// --- Relations ---
export const chatsRelations = relations(chats, ({ one, many }) => ({
  // user: one(users, { fields: [chats.userId], references: [users.id] }), // Removed relation to users
  messages: many(chatMessages),
  surveyResponses: many(surveyResponses), // Answers given within this chat
  conversationState: one(conversation_states, { fields: [chats.id], references: [conversation_states.chatId] }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  chat: one(chats, { fields: [chatMessages.chatId], references: [chats.id] }),
}));

export const conversationStatesRelations = relations(conversation_states, ({ one }) => ({
  chat: one(chats, { fields: [conversation_states.chatId], references: [chats.id] }),
})); 