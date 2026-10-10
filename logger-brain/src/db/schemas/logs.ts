import { boolean, integer, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { timestamps } from './commons.js';
import { genUUIDv7 } from '../../utils/uuidv7.js';
import { users } from './users.js';
import { projects } from './projects.js';
import { logMeetings } from './logMeetings.js';

export const logs = pgTable('logs', {
  id: uuid('id').primaryKey().$defaultFn(() => genUUIDv7()),
  userId: integer('user_id').notNull(),
  projectId: uuid('project_id').notNull(),
  description: text('description').notNull(),
  responsible: varchar('responsible', { length: 100 }).notNull(),
  tags: varchar('tags', { length: 255 }).notNull(),
  completed: boolean('completed'),
  comment: text('comment'),
  ...timestamps,
});

export const logsRelations = relations(logs, ({ one, many }) => ({
  user: one(users, { fields: [logs.userId], references: [users.id] }),
  project: one(projects, { fields: [logs.projectId], references: [projects.id] }),
  logMeetings: many(logMeetings),
}));

export type Log = typeof logs.$inferSelect;
export type NewLog = typeof logs.$inferInsert;
