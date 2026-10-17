import { integer, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

import { timestamps } from "./commons.js";
import { genUUIDv7 } from "../../utils/uuidv7.js";

export const requirements = pgTable("requirements", {
    id: uuid("id").primaryKey().$defaultFn(() => genUUIDv7()),
    userId: integer("user_id").notNull(),
    projectId: uuid("project_id").notNull(),
    meetingId: uuid("meeting_id"),
    name: varchar("name", { length: 255 }).notNull(),
    ...timestamps,
});

export type Requirement = typeof requirements.$inferSelect;
export type NewRequirement = typeof requirements.$inferInsert;
