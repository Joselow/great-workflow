import { and, desc, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { requirements, type NewRequirement } from "../db/schemas/requirements.js";
import { tasks } from "../db/schemas/tasks.js";
import { meetings } from "../db/schemas/meetings.js";
import { assertOwnedProject } from "./projectService.js";
import { BadRequestError400 } from "../errors/BadRequestError400.js";
import { NotFoundError404 } from "../errors/NotFoundError404.js";

export interface RequirementListFilters {
    projectId: string;
    meetingId?: string;
}

export interface RequirementCreateInput {
    name: string;
    projectId?: string;
    meetingId?: string;
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

async function assertMeetingInProject(meetingId: string, userId: number, projectId: string) {
    const meeting = await getOwnedMeeting(meetingId, userId);

    if (meeting.projectId !== projectId) {
        throw new BadRequestError400("Meeting project does not match");
    }

    return meeting;
}

export async function listRequirements(userId: number, filters: RequirementListFilters) {
    await assertOwnedProject(filters.projectId, userId);

    if (filters.meetingId) {
        await assertMeetingInProject(filters.meetingId, userId, filters.projectId);
    }

    return db.select().from(requirements)
        .where(and(
            eq(requirements.userId, userId),
            eq(requirements.projectId, filters.projectId),
            filters.meetingId ? eq(requirements.meetingId, filters.meetingId) : undefined,
        ))
        .orderBy(desc(requirements.createdAt));
}

export async function createRequirement(userId: number, input: RequirementCreateInput) {
    if (input.meetingId) {
        const meeting = await getOwnedMeeting(input.meetingId, userId);

        if (input.projectId !== undefined && input.projectId !== meeting.projectId) {
            throw new BadRequestError400("Project does not match the meeting");
        }

        const [requirement] = await db.insert(requirements).values({
            userId,
            projectId: meeting.projectId,
            meetingId: meeting.id,
            name: input.name,
        }).returning();

        return requirement;
    }

    if (!input.projectId) {
        throw new BadRequestError400("Project is required");
    }

    await assertOwnedProject(input.projectId, userId);

    const [requirement] = await db.insert(requirements).values({
        userId,
        projectId: input.projectId,
        meetingId: null,
        name: input.name,
    }).returning();

    return requirement;
}

export async function getRequirementByIdForUser(id: string, userId: number) {
    const [requirement] = await db.select().from(requirements)
        .where(and(eq(requirements.id, id), eq(requirements.userId, userId)));

    if (!requirement) {
        throw new NotFoundError404("Requirement not found");
    }

    return requirement;
}

export async function updateRequirement(id: string, userId: number, name: string) {
    const [requirement] = await db.update(requirements)
        .set({ name } satisfies Partial<NewRequirement>)
        .where(and(eq(requirements.id, id), eq(requirements.userId, userId)))
        .returning();

    if (!requirement) {
        throw new NotFoundError404("Requirement not found");
    }

    return requirement;
}

export async function deleteRequirement(id: string, userId: number) {
    const existing = await getRequirementByIdForUser(id, userId);

    await db.transaction(async (tx) => {
        await tx.update(tasks)
            .set({ requirementId: null })
            .where(and(eq(tasks.userId, userId), eq(tasks.requirementId, existing.id)));

        await tx.delete(requirements)
            .where(and(eq(requirements.id, existing.id), eq(requirements.userId, userId)));
    });
}
