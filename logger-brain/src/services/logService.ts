import { asc, and, eq, gte, isNull, lt, or } from "drizzle-orm";

import { db } from '../db/index.js';
import { logs, NewLog } from "../db/schemas/logs";
import { assertOwnedProject } from "./projectService.js";
import { NotFoundError404 } from "../errors/NotFoundError404.js";

interface LogUpdateInput {
    projectId?: string
    description?: string
    responsible?: string
    tags?: string
    comment?: string | null
    completed?: boolean | null
}

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
  await assertOwnedProject(newLog.projectId, newLog.userId)

  const [log] = await db.insert(logs).values(newLog).returning();
  return log
}

async function getOwnedLog(id: string, userId: number) {
    const [log] = await db.select().from(logs)
        .where(and(eq(logs.id, id), eq(logs.userId, userId)));

    if (!log) {
        throw new NotFoundError404('Log not found');
    }

    return log;
}

export async function updateLog(id: string, userId: number, changes: LogUpdateInput) {
    await getOwnedLog(id, userId);

    if (changes.projectId !== undefined) {
        await assertOwnedProject(changes.projectId, userId);
    }

    const payload: Partial<NewLog> = {};

    if (changes.projectId !== undefined) payload.projectId = changes.projectId;
    if (changes.description !== undefined) payload.description = changes.description;
    if (changes.responsible !== undefined) payload.responsible = changes.responsible;
    if (changes.tags !== undefined) payload.tags = changes.tags;
    if (changes.comment !== undefined) payload.comment = changes.comment;
    if (changes.completed !== undefined) payload.completed = changes.completed;

    const [log] = await db.update(logs)
        .set(payload)
        .where(and(eq(logs.id, id), eq(logs.userId, userId)))
        .returning();

    if (!log) {
        throw new NotFoundError404('Log not found');
    }

    return log;
}

export async function destroyLog(id: string, userId: number) {
    const [deleted] = await db.delete(logs)
        .where(and(eq(logs.id, id), eq(logs.userId, userId)))
        .returning();

    if (!deleted) {
        throw new NotFoundError404('Log not found');
    }

    return deleted;
}
  
