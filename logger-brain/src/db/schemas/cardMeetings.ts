import { pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { timestamps } from './commons.js';
import { genUUIDv7 } from '../../utils/uuidv7.js';
import { cards } from './cards.js';
import { meetings } from './meetings.js';

export const cardMeetings = pgTable('card_meetings', {
  id: uuid('id').primaryKey().$defaultFn(() => genUUIDv7()),
  cardId: uuid('card_id').notNull(),
  meetingId: uuid('meeting_id').notNull(),
  ...timestamps,
}, (table) => [
  uniqueIndex('card_meetings_card_id_meeting_id_uidx').on(table.cardId, table.meetingId),
]);

export const cardMeetingsRelations = relations(cardMeetings, ({ one }) => ({
  card: one(cards, { fields: [cardMeetings.cardId], references: [cards.id] }),
  meeting: one(meetings, { fields: [cardMeetings.meetingId], references: [meetings.id] }),
}));

export type CardMeeting = typeof cardMeetings.$inferSelect;
export type NewCardMeeting = typeof cardMeetings.$inferInsert;
