import { boolean, index, integer, pgTable, serial, text, uuid, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from './commons.js';

export const actionTemplates = pgTable('action_templates', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  cardId: uuid('card_id'),
  module: varchar('module', { length: 20 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  action: text('action'),
  template: text('template').notNull().default(''),
  color: varchar('color', { length: 7 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  ...timestamps,
}, (table) => [
  index('action_templates_user_id_module_idx').on(table.userId, table.module),
]);

export type ActionTemplate = typeof actionTemplates.$inferSelect;
export type NewActionTemplate = typeof actionTemplates.$inferInsert;
