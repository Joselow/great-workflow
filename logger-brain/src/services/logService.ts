import { asc, eq } from "drizzle-orm";

import { db } from '../db/index.js';
import { logs, NewLog } from "../db/schemas/logs";


export async function getLog(userId: number) {
    const logsData = await db.select().from(logs)
      .where(eq(logs.userId, userId))
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
  
