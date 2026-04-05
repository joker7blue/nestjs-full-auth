import {
  pgSchema,
  serial,
  varchar,
  boolean,
  integer,
  timestamp,
  text,
  json,
  bigint,
  bigserial,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { auditFields } from './common.schema';

export const ssoSchema = pgSchema('sso');

// -------------------- USERS --------------------
export const users = ssoSchema.table('users', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  email: varchar('email', { length: 255 }).unique(),
  phoneNumber: varchar('phone_number', { length: 50 }).unique(),
  password: varchar('password', { length: 255 }),
  emailVerified: boolean('email_verified').notNull().default(false),
  phoneVerified: boolean('phone_verified').notNull().default(false),
  twoFactorEnabled: boolean('two_factor_enabled').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  ...auditFields,
});

// Typescript exports
export type UserSelect = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;

// -------------------- USER PROFILES --------------------
export const userProfiles = ssoSchema.table('user_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .unique(),
  photoId: integer('photo_id').references(() => files.id),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  bio: text('bio'),
  ...auditFields,
});
export type UserProfileSelect = typeof userProfiles.$inferSelect;
export type UserProfileInsert = typeof userProfiles.$inferInsert;

// -------------------- ROLES --------------------
export const roles = ssoSchema.table('roles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).unique().notNull(),
  description: varchar('description', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
export type RoleSelect = typeof roles.$inferSelect;
export type RoleInsert = typeof roles.$inferInsert;

// -------------------- USERS-ROLES --------------------
export const userRoles = ssoSchema.table(
  'users_roles',
  {
    id: bigserial({ mode: 'number' }).primaryKey().notNull(),
    userId: bigint('user_id', { mode: 'number' }).references(() => users.id),
    roleId: integer('role_id').references(() => roles.id),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  //(t) => [primaryKey({ columns: [t.userId, t.roleId] })],
);
export type UserRoleSelect = typeof userRoles.$inferSelect;
export type UserRoleInsert = typeof userRoles.$inferInsert;

// -------------------- CODE / TOKENS --------------------
export const codeTokens = ssoSchema.table('code_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  codeOrToken: varchar('code_or_token', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'reset_password', 'email_verification', 'phone_2fa'
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').default(false),
  ...auditFields,
});
export type CodeTokenSelect = typeof codeTokens.$inferSelect;
export type CodeTokenInsert = typeof codeTokens.$inferInsert;

// -------------------- AUTHORIZE --------------------
export const authorize = ssoSchema.table('authorize', {
  id: serial('id').primaryKey(),
  clientId: varchar('client_id', { length: 255 }).unique().notNull(),
  clientSecret: varchar('client_secret', { length: 255 }).unique(),
  redirectUris: text('redirect_uris').array().notNull(),
  ...auditFields,
});
export type AuthorizeSelect = typeof authorize.$inferSelect;
export type AuthorizeInsert = typeof authorize.$inferInsert;

// -------------------- SESSIONS --------------------
export const sessions = ssoSchema.table('sessions', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: bigint('user_id', { mode: 'number' })
    .references(() => users.id)
    .notNull(),
  refreshToken: varchar('refresh_token', { length: 255 }).notNull(),
  deviceId: varchar('device_id', { length: 255 }).notNull(),

  ipAddress: varchar('ip_address', { length: 50 }),

  userAgent: text('user_agent'),
  os: varchar('os', { length: 100 }),
  browser: varchar('browser', { length: 100 }),
  device: varchar('device', { length: 100 }),

  // localisation
  country: varchar('country', { length: 100 }),
  region: varchar('region', { length: 100 }),
  city: varchar('city', { length: 100 }),
  loc: varchar('loc', { length: 50 }), // latitude,longitude
  timezone: varchar('timezone', { length: 100 }),

  revoked: boolean('revoked').notNull().default(false),
  expiresAt: timestamp('expires_at').notNull(),
  ...auditFields,
});
export type SessionSelect = typeof sessions.$inferSelect;
export type SessionInsert = typeof sessions.$inferInsert;

// -------------------- KYC / VERIFICATIONS --------------------
export const kyc = ssoSchema.table('kyc', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  serviceProvider: varchar('service_provider', { length: 255 }), // ex: "Onfido", "Sumsub"
  externalReference: varchar('external_reference', { length: 255 }), // ID renvoyé par le service
  status: varchar('status', { length: 50 }), // ex: "pending", "verified", "rejected"
  details: json('details'), // info retournée par le service externe
  ...auditFields,
});
export type KycSelect = typeof kyc.$inferSelect;
export type KycInsert = typeof kyc.$inferInsert;

//  -------------------- FILES --------------------
export const files = ssoSchema.table('files', {
  id: serial('id').primaryKey(),
  filename: varchar('filename', { length: 255 }).notNull(),
  url: varchar('url', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }),
  //size: integer('size'), // in bytes
  ...auditFields,
});
export type FileSelect = typeof files.$inferSelect;
export type FileInsert = typeof files.$inferInsert;

// -------------------- RELATIONS --------------------
export const usersRelations = relations(users, ({ many, one }) => ({
  userProfile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  kyc: one(kyc),
  userRoles: many(userRoles),
  tokens: many(codeTokens),
  sessions: many(sessions),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, { fields: [userProfiles.userId], references: [users.id] }),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
  role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
}));

export const codeTokensRelations = relations(codeTokens, ({ one }) => ({
  user: one(users, { fields: [codeTokens.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const kycRelations = relations(kyc, ({ one }) => ({
  user: one(users, { fields: [kyc.userId], references: [users.id] }),
}));
