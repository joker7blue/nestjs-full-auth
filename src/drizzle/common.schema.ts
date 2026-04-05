import { timestamp } from 'drizzle-orm/pg-core';

// Reusable audit fields
export const auditFields = {
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
};

// Common utility types
export type AuditFields = typeof auditFields;
