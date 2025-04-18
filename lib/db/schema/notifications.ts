import {
  pgTable,
  serial,
  text,
  timestamp,
  index,
  uuid,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
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

// --- Notifications Table ---
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull(),
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

// --- Relations ---
// Relation to users removed
// export const notificationsRelations = relations(notifications, ({ one }) => ({
//   user: one(users, { fields: [notifications.userId], references: [users.id] }),
// })); 