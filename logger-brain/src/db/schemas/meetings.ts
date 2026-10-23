import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { timestamps } from './commons.js';
import { genUUIDv7 } from '../../utils/uuidv7.js';

import { users } from './users.js';
import { projects } from './projects.js';
import { logMeetings } from './logMeetings.js';
import { cardMeetings } from './cardMeetings.js';
import { issues } from './issues.js';

export const meetings = pgTable('meetings', {
  id: uuid('id').primaryKey().$defaultFn(() => genUUIDv7()),
  userId: integer('user_id').notNull(),
  projectId: uuid('project_id'),
  title: varchar('title', { length: 100 }).notNull(),
  date: timestamp('date', { withTimezone: true }).notNull(),
  estimatedDuration: integer('estimated_duration').notNull(),
  topicStatus: text('topic_status').notNull().default(''),
  objective: varchar('objective', { length: 255 }).notNull().default(''),
  participants: text('participants').notNull().default(''),
  color: varchar('color', { length: 7 }).notNull().default('#f5f5f4'),
  summary: text('summary'),
  lessons: text('lessons'),
  executed: boolean('executed').notNull().default(false),
  objectiveAchieved: boolean('objective_achieved'),
  additionalInfo: text('additional_info'),
  platform: varchar('platform', { length: 30 }),
  meetingUrl: text('meeting_url'),
  accessDetails: text('access_details'),
  duration: integer('duration'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  runningSince: timestamp('running_since', { withTimezone: true }),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
  ...timestamps,
});

export const meetingsRelations = relations(meetings, ({ one, many }) => ({
  user: one(users, { fields: [meetings.userId], references: [users.id] }),
  project: one(projects, { fields: [meetings.projectId], references: [projects.id] }),
  logMeetings: many(logMeetings),
  cardMeetings: many(cardMeetings),
  issues: many(issues),
}));

export type Meeting = typeof meetings.$inferSelect;
export type NewMeeting = typeof meetings.$inferInsert;
