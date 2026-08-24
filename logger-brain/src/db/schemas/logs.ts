import { boolean, integer, pgTable, text, uuid, varchar, char } from 'drizzle-orm/pg-core';

import { timestamps } from './commons.js';

import { genUUIDv7 } from '../../utils/uuidv7.js';
import { relations } from 'drizzle-orm';
import { users } from './users.js';
import { meetings } from './meetings.js';
import { projects } from './projects.js';

export const logs = pgTable('logs', {
  id: uuid('id').primaryKey().$defaultFn(() => genUUIDv7 ()),
  userId: integer('user_id').notNull(),
  projectId: uuid('project_id').notNull(),
  meetingId: uuid('meeting_id'),
  typeMeetingLink: char('type_meeting_link', { length: 8 }), // dirección del vínculo con el meeting: log→meet | meet→log
  description: text('description').notNull(),
  responsible: varchar('responsible', { length: 100 }).notNull(),
  tags: varchar('tags', { length: 255 }).notNull(),
  completed: boolean('completed'),
  comment: text('comment'),
  ...timestamps
});


export const logsRelations = relations(logs, ({ one }) => ({
  user: one(users, { fields: [logs.userId], references: [users.id] }),
  project: one(projects, { fields: [logs.projectId], references: [projects.id] }),
  meeting: one(meetings, { fields: [logs.meetingId], references: [meetings.id] }),
}));


export type Log = typeof logs.$inferSelect;
export type NewLog = typeof logs.$inferInsert;
