import { integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { users } from './users';

export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  color: varchar('color', { length: 20 }).notNull(),
});

export const tagsRelations = relations(tags, ({ one }) => ({
  user: one(users, { fields: [tags.userId], references: [users.id] }),
}));

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;