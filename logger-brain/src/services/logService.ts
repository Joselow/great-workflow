import { asc, and, eq, gte, isNull, lt, or } from "drizzle-orm";

import { db } from '../db/index.js';
import { logs, NewLog } from "../db/schemas/logs";

interface LogListFilters {
    projectId?: string
    completed?: boolean
    from?: string
    to?: string
}

function startOfDay(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
}

function startOfNextDay(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day + 1)
}

export async function getLog(userId: number, filters: LogListFilters = {}) {
    const { projectId, completed, from, to } = filters

    const logsData = await db.select().from(logs)
      .where(and(
        eq(logs.userId, userId),
        projectId ? eq(logs.projectId, projectId) : undefined,
        completed === true ? eq(logs.completed, true) : undefined,
        completed === false
          ? or(eq(logs.completed, false), isNull(logs.completed))
          : undefined,
        from ? gte(logs.createdAt, startOfDay(from)) : undefined,
        to ? lt(logs.createdAt, startOfNextDay(to)) : undefined,
      ))
      .orderBy(asc(logs.createdAt));
    return logsData
}

export async function createLog(newLog: NewLog) {
  const [log] = await db.insert(logs).values(newLog).returning();
  return log
}

export async function updateLog(id: string, changes: Partial<NewLog>) {
    const [log] = await db.update(logs).set(changes).where(eq(logs.id, id)).returning();
    return log
}

  
export async function destroyLog(id: string) {
  const [deleted] = await db.delete(logs).where(eq(logs.id, id)).returning();  
  return deleted;
}
  
