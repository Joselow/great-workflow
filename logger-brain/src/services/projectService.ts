import { asc, and, eq } from "drizzle-orm";

import { db } from '../db/index.js';
import { projects, NewProject } from "../db/schemas/projects.js";
import { NotFoundError404 } from "../errors/NotFoundError404.js";

export async function getProjects(userId: number) {
    return db.select().from(projects)
        .where(eq(projects.userId, userId))
        .orderBy(asc(projects.createdAt));
}

export async function createProject(newProject: NewProject) {
    const [project] = await db.insert(projects).values(newProject).returning();
    return project;
}

export async function updateProject(id: string, userId: number, changes: Partial<NewProject>) {
    const [project] = await db.update(projects)
        .set(changes)
        .where(and(eq(projects.id, id), eq(projects.userId, userId)))
        .returning();

    if (!project) {
        throw new NotFoundError404('Project not found');
    }

    return project;
}
