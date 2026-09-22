import { asc, and, eq } from "drizzle-orm";

import { db } from '../db/index.js';
import { projects, NewProject } from "../db/schemas/projects.js";
import { BadRequestError400 } from "../errors/BadRequestError400.js";
import { NotFoundError404 } from "../errors/NotFoundError404.js";

export async function getProjects(userId: number) {
    return db.select().from(projects)
        .where(eq(projects.userId, userId))
        .orderBy(asc(projects.createdAt));
}

export async function getProjectById(id: string) {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
}

export async function assertOwnedProject(projectId: string, userId: number) {
    const project = await getProjectById(projectId);

    if (!project || project.userId !== userId) {
        throw new BadRequestError400('Project not found');
    }

    return project;
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

export async function deleteProject(id: string) {
    const [project] = await db.delete(projects)
        .where(eq(projects.id, id))
        .returning();
    return project;
}