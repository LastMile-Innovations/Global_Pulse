import {
  pgTable,
  serial,
  text,
  timestamp,
  index,
  jsonb,
  uuid,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- Admin Audit Logs Table ---
export const admin_audit_logs = pgTable('admin_audit_logs', {
  id: serial('id').primaryKey(),
  adminUserId: uuid('admin_user_id').notNull(),
  action: text('action').notNull(), // Description of action (e.g., 'updated_topic', 'processed_payout')
  targetType: text('target_type'), // e.g., 'topic', 'user', 'payout'
  targetId: text('target_id'), // ID of the entity affected
  details: jsonb('details'), // Additional context/changes
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  adminUserIdx: index('audit_admin_user_idx').on(table.adminUserId),
  targetIdx: index('audit_target_idx').on(table.targetType, table.targetId),
}));

// --- Relations ---
// Relation to users removed as users table is gone
// export const adminAuditLogsRelations = relations(admin_audit_logs, ({ one }) => ({
//   adminUser: one(users, { fields: [admin_audit_logs.adminUserId], references: [users.id] }),
// })); 