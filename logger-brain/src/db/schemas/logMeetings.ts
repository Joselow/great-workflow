import { pgTable, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { timestamps } from './commons.js';
import { genUUIDv7 } from '../../utils/uuidv7.js';
import { logs } from './logs.js';
import { meetings } from './meetings.js';

export type LogMeetingSource = 'log' | 'meeting';

export const logMeetings = pgTable('log_meetings', {
  id: uuid('id').primaryKey().$defaultFn(() => genUUIDv7()),
  logId: uuid('log_id').notNull(),
  meetingId: uuid('meeting_id').notNull(),
  source: varchar('source', { length: 8 }).$type<LogMeetingSource>().notNull(),
  ...timestamps,
}, (table) => [
  uniqueIndex('log_meetings_log_id_meeting_id_uidx').on(table.logId, table.meetingId),
]);

export const logMeetingsRelations = relations(logMeetings, ({ one }) => ({
  log: one(logs, { fields: [logMeetings.logId], references: [logs.id] }),
  meeting: one(meetings, { fields: [logMeetings.meetingId], references: [meetings.id] }),
}));

export type LogMeeting = typeof logMeetings.$inferSelect;
export type NewLogMeeting = typeof logMeetings.$inferInsert;
