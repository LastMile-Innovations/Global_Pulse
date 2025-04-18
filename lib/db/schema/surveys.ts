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
import { chats } from './chats';

// Enums
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
  userId: uuid('user_id').notNull(),
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

// --- Relations ---
export const topicsRelations = relations(topics, ({ many }) => ({
  questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  topic: one(topics, { fields: [questions.topicId], references: [topics.id] }),
  responses: many(surveyResponses),
}));

export const surveyResponsesRelations = relations(surveyResponses, ({ one }) => ({
  question: one(questions, { fields: [surveyResponses.questionId], references: [questions.id] }),
  chat: one(chats, { fields: [surveyResponses.chatId], references: [chats.id] }),
})); 