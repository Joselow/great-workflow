import { and, desc, eq, isNull } from "drizzle-orm";

import { db } from "../db/index.js";
import { tasks, type NewTask } from "../db/schemas/tasks.js";
import { requirements } from "../db/schemas/requirements.js";
import { meetings } from "../db/schemas/meetings.js";
import { assertOwnedProject } from "./projectService.js";
import { BadRequestError400 } from "../errors/BadRequestError400.js";
import { NotFoundError404 } from "../errors/NotFoundError404.js";

export interface TaskListFilters {
    projectId: string;
    meetingId?: string;
    requirementId?: string | null;
    completed?: boolean;
}

export interface TaskCreateInput {
    name: string;
    description?: string;
    completed?: boolean;
    projectId?: string;
    meetingId?: string;
    requirementId?: string;
}

export interface TaskUpdateInput {
    name?: string;
    description?: string;
    completed?: boolean;
    requirementId?: string | null;
}

async function getOwnedMeeting(meetingId: string, userId: number) {
    const [meeting] = await db.select().from(meetings)
        .where(and(eq(meetings.id, meetingId), eq(meetings.userId, userId)));

    if (!meeting) {
        throw new BadRequestError400("Meeting not found");
    }

    const projectId = meeting.projectId;

    if (!projectId) {
        throw new BadRequestError400("Meeting has no project");
    }

    return { ...meeting, projectId };
}

async function getOwnedRequirement(requirementId: string, userId: number) {
    const [requirement] = await db.select().from(requirements)
        .where(and(eq(requirements.id, requirementId), eq(requirements.userId, userId)));

    if (!requirement) {
        throw new BadRequestError400("Requirement not found");
    }

    return requirement;
}

export async function listTasks(userId: number, filters: TaskListFilters) {
    await assertOwnedProject(filters.projectId, userId);

    if (filters.meetingId) {
        const meeting = await getOwnedMeeting(filters.meetingId, userId);

        if (meeting.projectId !== filters.projectId) {
            throw new BadRequestError400("Meeting project does not match");
        }
    }

    if (typeof filters.requirementId === "string") {
        const requirement = await getOwnedRequirement(filters.requirementId, userId);

        if (requirement.projectId !== filters.projectId) {
            throw new BadRequestError400("Requirement project does not match");
        }
    }

    return db.select().from(tasks)
        .where(and(
            eq(tasks.userId, userId),
            eq(tasks.projectId, filters.projectId),
            filters.meetingId ? eq(tasks.meetingId, filters.meetingId) : undefined,
            filters.requirementId === null ? isNull(tasks.requirementId) : undefined,
            typeof filters.requirementId === "string"
                ? eq(tasks.requirementId, filters.requirementId)
                : undefined,
            filters.completed !== undefined ? eq(tasks.completed, filters.completed) : undefined,
        ))
        .orderBy(desc(tasks.createdAt));
}

export async function createTask(userId: number, input: TaskCreateInput) {
    const description = input.description ?? "";
    const completed = input.completed ?? false;

    let projectId: string;
    let meetingId: string | null;
    let requirementId: string | null;

    if (input.requirementId) {
        const requirement = await getOwnedRequirement(input.requirementId, userId);

        if (input.projectId !== undefined && input.projectId !== requirement.projectId) {
            throw new BadRequestError400("Project does not match the requirement");
        }

        if (input.meetingId !== undefined && input.meetingId !== requirement.meetingId) {
            throw new BadRequestError400("Meeting does not match the requirement");
        }

        projectId = requirement.projectId;
        meetingId = requirement.meetingId;
        requirementId = requirement.id;
    } else if (input.meetingId) {
        const meeting = await getOwnedMeeting(input.meetingId, userId);

        if (input.projectId !== undefined && input.projectId !== meeting.projectId) {
            throw new BadRequestError400("Project does not match the meeting");
        }

        projectId = meeting.projectId;
        meetingId = meeting.id;
        requirementId = null;
    } else if (input.projectId) {
        await assertOwnedProject(input.projectId, userId);
        projectId = input.projectId;
        meetingId = null;
        requirementId = null;
    } else {
        throw new BadRequestError400("Project, meeting, or requirement is required");
    }

    const [task] = await db.insert(tasks).values({
        userId,
        projectId,
        meetingId,
        requirementId,
        name: input.name,
        description,
        completed,
    }).returning();

    return task;
}

export async function getTaskByIdForUser(id: string, userId: number) {
    const [task] = await db.select().from(tasks)
        .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));

    if (!task) {
        throw new NotFoundError404("Task not found");
    }

    return task;
}

export async function updateTask(id: string, userId: number, changes: TaskUpdateInput) {
    await getTaskByIdForUser(id, userId);

    const payload: Partial<NewTask> = {};

    if (changes.name !== undefined) payload.name = changes.name;
    if (changes.description !== undefined) payload.description = changes.description;
    if (changes.completed !== undefined) payload.completed = changes.completed;

    if (changes.requirementId !== undefined) {
        if (changes.requirementId === null) {
            payload.requirementId = null;
        } else {
            const requirement = await getOwnedRequirement(changes.requirementId, userId);
            payload.requirementId = requirement.id;
            payload.projectId = requirement.projectId;
            payload.meetingId = requirement.meetingId;
        }
    }

    const [task] = await db.update(tasks)
        .set(payload)
        .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
        .returning();

    if (!task) {
        throw new NotFoundError404("Task not found");
    }

    return task;
}

export async function patchTaskCompleted(id: string, userId: number, completed: boolean) {
    const [task] = await db.update(tasks)
        .set({ completed })
        .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
        .returning();

    if (!task) {
        throw new NotFoundError404("Task not found");
    }

    return task;
}

export async function deleteTask(id: string, userId: number) {
    const [task] = await db.delete(tasks)
        .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
        .returning();

    if (!task) {
        throw new NotFoundError404("Task not found");
    }

    return task;
}
