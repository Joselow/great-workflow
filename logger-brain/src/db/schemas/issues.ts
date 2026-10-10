import { pgTable, serial, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { timestamps } from './commons.js';
import { meetings } from './meetings.js';

export const issues = pgTable('issues', {
  id: serial('id').primaryKey(),
  meetingId: uuid('meeting_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  color: varchar('color', { length: 7 }).notNull().default('#f5f5f4'),
  ...timestamps,
});

export const issuesRelations = relations(issues, ({ one }) => ({
  meeting: one(meetings, { fields: [issues.meetingId], references: [meetings.id] }),
}));

export type Issue = typeof issues.$inferSelect;
export type NewIssue = typeof issues.$inferInsert;
