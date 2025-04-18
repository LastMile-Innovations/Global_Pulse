import {
  pgTable,
  text,
  timestamp,
  boolean,
  // varchar, // Keep varchar for existing users table if needed, or remove if replacing - Removing as replacing users table
  uniqueIndex,
  index, // Added index
  uuid,
  pgEnum, // Added pgEnum
} from 'drizzle-orm/pg-core';
// import { relations } from 'drizzle-orm'; // Removed relations import as users table is gone
// Removed imports for chats and surveyResponses as usersRelations is removed

// Define Enums for Status fields - improves type safety and consistency
export const userRoleEnum = pgEnum('user_role', ['user', 'admin', 'moderator', 'analyst', 'support', 'guest']);

// --- Profiles ---
// Stores user-specific attributes, settings, and flags. Linked 1-to-1 with users.
// The ID now directly corresponds to the Supabase Auth user ID.
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

// --- Removed users table definition ---

// --- Removed usersRelations definition ---

// --- Removed profilesRelations definition (linking to a non-existent users table) ---
