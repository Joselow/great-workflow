import { boolean, index, integer, jsonb, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

import { timestamps } from './commons.js';
import { genUUIDv7 } from '../../utils/uuidv7.js';
import { users } from './users.js';
import { projects } from './projects.js';

export interface CardSection {
  title: string;
  description: string;
}

export const cards = pgTable('cards', {
  id: uuid('id').primaryKey().$defaultFn(() => genUUIDv7()),
  userId: integer('user_id').notNull(),
  projectId: uuid('project_id'),
  meetingId: uuid('meeting_id'),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull().default(''),
  color: varchar('color', { length: 7 }).notNull().default('#f5f5f4'),
  isPrompt: boolean('is_prompt').notNull().default(false),
  flMeeting: boolean('fl_meeting').notNull().default(false),
  sections: jsonb('sections').$type<CardSection[]>().notNull().default(sql`'[]'::jsonb`),
  ...timestamps,
}, (table) => [
  index('cards_user_id_updated_at_idx').on(table.userId, table.updatedAt),
]);

export const cardsRelations = relations(cards, ({ one }) => ({
  user: one(users, { fields: [cards.userId], references: [users.id] }),
  project: one(projects, { fields: [cards.projectId], references: [projects.id] }),
}));

export type Card = typeof cards.$inferSelect;
export type NewCard = typeof cards.$inferInsert;
