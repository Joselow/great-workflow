import { boolean, integer, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";

import { timestamps } from "./commons.js";
import { genUUIDv7 } from "../../utils/uuidv7.js";

export const tasks = pgTable("tasks", {
    id: uuid("id").primaryKey().$defaultFn(() => genUUIDv7()),
    userId: integer("user_id").notNull(),
    projectId: uuid("project_id").notNull(),
    meetingId: uuid("meeting_id"),
    requirementId: uuid("requirement_id"),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description").notNull().default(""),
    completed: boolean("completed").notNull().default(false),
    ...timestamps,
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
