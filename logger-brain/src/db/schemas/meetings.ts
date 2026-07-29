import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { timestamps } from './commons.js';
import { genUUIDv7 } from '../../utils/uuidv7.js';

import { users } from './users.js';
import { logs } from './logs.js';

export const meetings = pgTable('meetings', {
  id: uuid('id').primaryKey().$defaultFn(() => genUUIDv7()),
  userId: integer('user_id').notNull(),
  date: timestamp('date').notNull(),
  estimatedDuration: integer('estimated_duration').notNull(), // minutos
  state: text('state').notNull(),
  objective: varchar('objective', { length: 255 }).notNull(),
  summary: text('summary'),
  lessons: text('lessons'),
  executed: boolean('executed').notNull().default(false),
  objectiveAchieved: boolean('objective_achieved'),
  ...timestamps
});


export const meetingsRelations = relations(meetings, ({ one, many }) => ({
  user: one(users, { fields: [meetings.userId], references: [users.id] }),
  logs: many(logs),
}));

export type Meeting = typeof meetings.$inferSelect;
export type NewMeeting = typeof meetings.$inferInsert;
