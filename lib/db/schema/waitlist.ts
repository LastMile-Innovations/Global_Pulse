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
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// Enums
export const waitlistStatusEnum = pgEnum('waitlist_status', [
  'pending', 'invited', 'converted', 'removed'
]);

export const waitlistInvitationStatusEnum = pgEnum('waitlist_invitation_status', [
  'sent', 'accepted', 'expired', 'revoked'
]);

// --- Waitlist Users Table ---
export const waitlist_users = pgTable('waitlist_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  interest: text('interest'),
  referralCode: varchar('referral_code', { length: 16 }).notNull().unique(),
  referredByCode: varchar('referred_by_code', { length: 16 }),
  priorityScore: integer('priority_score').default(0).notNull(),
  referralCount: integer('referral_count').default(0).notNull(),
  status: text('status', { enum: ['pending', 'invited', 'converted', 'removed'] }).default('pending').notNull(),
  emailPreferences: jsonb('email_preferences'),
  privacyAccepted: boolean('privacy_accepted').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
}, (table) => ({
  emailIdx: uniqueIndex('waitlist_users_email_idx').on(table.email),
  referralCodeIdx: uniqueIndex('waitlist_users_referral_code_idx').on(table.referralCode),
  referredByCodeIdx: index('waitlist_users_referred_by_code_idx').on(table.referredByCode),
}));

// --- Waitlist Referrals Table ---
export const waitlist_referrals = pgTable('waitlist_referrals', {
  id: serial('id').primaryKey(),
  referrerId: uuid('referrer_id').notNull().references(() => waitlist_users.id, { onDelete: 'cascade' }),
  referredId: uuid('referred_id').notNull().references(() => waitlist_users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  referrerIdx: index('waitlist_referrals_referrer_idx').on(table.referrerId),
  referredIdx: index('waitlist_referrals_referred_idx').on(table.referredId),
}));

// --- Waitlist Invitations Table ---
export const waitlist_invitations = pgTable('waitlist_invitations', {
  id: serial('id').primaryKey(),
  waitlistUserId: uuid('waitlist_user_id').notNull().references(() => waitlist_users.id, { onDelete: 'cascade' }),
  invitationCode: varchar('invitation_code', { length: 24 }).notNull().unique(),
  status: text('status', { enum: ['sent', 'accepted', 'expired', 'revoked'] }).default('sent').notNull(),
  sentAt: timestamp('sent_at', { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  batchId: integer('batch_id'),
}, (table) => ({
  waitlistUserIdx: index('waitlist_invitations_user_idx').on(table.waitlistUserId),
  invitationCodeIdx: uniqueIndex('waitlist_invitations_code_idx').on(table.invitationCode),
}));

// --- Waitlist Activity Logs Table ---
export const waitlist_activity_logs = pgTable('waitlist_activity_logs', {
  id: serial('id').primaryKey(),
  waitlistUserId: uuid('waitlist_user_id').references(() => waitlist_users.id, { onDelete: 'set null' }),
  action: text('action').notNull(), // e.g., signup, referral, status_check, invite_sent, converted, admin_adjust
  details: jsonb('details'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  waitlistUserIdx: index('waitlist_activity_logs_user_idx').on(table.waitlistUserId),
  actionIdx: index('waitlist_activity_logs_action_idx').on(table.action),
}));

// --- Waitlist Settings Table ---
export const waitlist_settings = pgTable('waitlist_settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
});

// --- Waitlist Relations ---
export const waitlistUsersRelations = relations(waitlist_users, ({ many }) => ({
  referrals: many(waitlist_referrals),
  invitations: many(waitlist_invitations),
  activityLogs: many(waitlist_activity_logs),
}));

export const waitlistReferralsRelations = relations(waitlist_referrals, ({ one }) => ({
  referrer: one(waitlist_users, { fields: [waitlist_referrals.referrerId], references: [waitlist_users.id] }),
  referred: one(waitlist_users, { fields: [waitlist_referrals.referredId], references: [waitlist_users.id] }),
}));

export const waitlistInvitationsRelations = relations(waitlist_invitations, ({ one }) => ({
  waitlistUser: one(waitlist_users, { fields: [waitlist_invitations.waitlistUserId], references: [waitlist_users.id] }),
}));

export const waitlistActivityLogsRelations = relations(waitlist_activity_logs, ({ one }) => ({
  waitlistUser: one(waitlist_users, { fields: [waitlist_activity_logs.waitlistUserId], references: [waitlist_users.id] }),
}));

// --- Types ---
export type WaitlistUser = InferSelectModel<typeof waitlist_users>;
export type NewWaitlistUser = InferInsertModel<typeof waitlist_users>; 