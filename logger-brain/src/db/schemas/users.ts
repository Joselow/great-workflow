import { boolean, pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { timestamps } from './commons.js';

import { logs } from './logs.js';
import { meetings } from './meetings.js';
import { tags } from './tags.js';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 15 }),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps
});


export const usersRelations = relations(users, ({ many }) => ({
  logs: many(logs),
  meetings: many(meetings),
  tags: many(tags),
}));


export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;