import { asc, and, eq } from "drizzle-orm";

import { db } from '../db/index.js';
import { logs, NewLog } from "../db/schemas/logs";


export async function getLog(userId: number, projectId?: string) {
    const conditions = [eq(logs.userId, userId)];

    if (projectId) {
        conditions.push(eq(logs.projectId, projectId));
    }

    const logsData = await db.select().from(logs)
      .where(and(...conditions))
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
  
