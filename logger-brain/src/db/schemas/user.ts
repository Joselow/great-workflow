import { boolean, pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { timestamps } from './commons.js';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 15 }),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;