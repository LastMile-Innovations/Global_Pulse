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
  primaryKey,
  jsonb,
  uuid,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// --- Users & Auth ---
export const users = pgTable('users', {
  id: uuid('id').primaryKey().references(() => profiles.id, { onDelete: 'cascade' }),
  email: text('email').notNull().unique(),
  role: text('role', { enum: ['user', 'admin'] }).default('user').notNull(),
  // Add other profile fields if managed here (e.g., avatar_url, flags)
  // completed_first_chat: boolean('completed_first_chat').default(false).notNull(),
  // completed_first_survey: boolean('completed_first_survey').default(false).notNull(),
  // viewed_explore: boolean('viewed_explore').default(false).notNull(),
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
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
  // topic: text('topic'), // Consider FK to topics table
}, (table) => ({
  userIdx: index('chats_user_id_idx').on(table.userId),
}));

export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  chatId: varchar('chat_id', { length: 21 }).notNull().references(() => chats.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['user', 'assistant', 'system', 'tool'] }).notNull(),
  content: text('content').notNull(), // Store text content
  toolCalls: jsonb('tool_calls'), // Store tool call info if needed
  toolResults: jsonb('tool_results'), // Store tool result info if needed
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  chatIdIdx: index('messages_chat_id_idx').on(table.chatId),
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
  type: text('type', { enum: ['multipleChoice', 'sliderScale', 'buttons'] }).notNull(),
  parameters: jsonb('parameters'), // Store options, min/max, labels etc.
  topicId: varchar('topic_id', { length: 50 }).references(() => topics.id, { onDelete: 'set null' }), // Link to topics
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  topicIdx: index('questions_topic_id_idx').on(table.topicId),
}));

export const surveyResponses = pgTable('survey_responses', {
    id: varchar('id', { length: 21 }).primaryKey(), // Match nanoid length
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    questionId: integer('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
    optionId: text('option_id'), // For choice/button answers
    numericValue: integer('numeric_value'), // For slider answers
    textValue: text('text_value'), // For potential future free-text answers
    source: text('source', { enum: ['chat', 'survey_feed'] }).notNull(),
    chatId: varchar('chat_id', { length: 21 }).references(() => chats.id, { onDelete: 'set null' }), // Link if answered in chat
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    // Ensure a user answers a specific question only ONCE regardless of source
    userQuestionUniqueIdx: uniqueIndex('responses_user_question_unique_idx').on(table.userId, table.questionId),
    questionIdx: index('responses_question_id_idx').on(table.questionId),
}));

// --- Profiles ---
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // Matches Supabase auth user ID
  firstName: text('first_name'),
  lastName: text('last_name'),
  // Add getting started flags
  completed_first_chat: boolean('completed_first_chat').default(false).notNull(),
  completed_first_survey: boolean('completed_first_survey').default(false).notNull(),
  viewed_explore: boolean('viewed_explore').default(false).notNull(),
  // Add other profile fields if they exist
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
});

// --- Define Relations ---
export const usersRelations = relations(users, ({ many }) => ({
  chats: many(chats),
  surveyResponses: many(surveyResponses),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
  user: one(users, { fields: [chats.userId], references: [users.id] }),
  messages: many(chatMessages),
  surveyResponses: many(surveyResponses), // Answers given within this chat
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

// --- Export Combined Schema ---
export const schema = {
  users,
  chats,
  chatMessages,
  topics,
  questions,
  surveyResponses,
  profiles,
  // Relations are implicitly included by Drizzle when passing this object
  usersRelations,
  chatsRelations,
  chatMessagesRelations,
  topicsRelations,
  questionsRelations,
  surveyResponsesRelations,
};
