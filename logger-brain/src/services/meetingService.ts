import { and, asc, count, desc, eq, gte, inArray, isNull, lt } from "drizzle-orm";

import { db } from "../db/index.js";
import { meetings, type NewMeeting } from "../db/schemas/meetings.js";
import { cardMeetings } from "../db/schemas/cardMeetings.js";
import { logMeetings, type LogMeetingSource } from "../db/schemas/logMeetings.js";
import { issues } from "../db/schemas/issues.js";
import { cards } from "../db/schemas/cards.js";
import { logs } from "../db/schemas/logs.js";
import { projects } from "../db/schemas/projects.js";
import { requirements } from "../db/schemas/requirements.js";
import { tasks } from "../db/schemas/tasks.js";
import { getProjectById } from "./projectService.js";
import { BadRequestError400 } from "../errors/BadRequestError400.js";
import { NotFoundError404 } from "../errors/NotFoundError404.js";
import { nextStepTags } from "../utils/objectiveKeywords.js";

export interface MeetingLogLinkInput {
    logId: string;
    source: LogMeetingSource;
}

export interface MeetingNextStepInput {
    logId?: string;
    description: string;
}

export interface MeetingWriteInput {
    title?: string;
    date?: string;
    estimatedDuration?: number;
    topicStatus?: string;
    objective?: string;
    participants?: string;
    color?: string;
    projectId?: string | null;
    issues?: { id?: number; name: string; color?: string }[];
    cardIds?: string[];
    logLinks?: MeetingLogLinkInput[];
    nextSteps?: MeetingNextStepInput[];
    summary?: string | null;
    lessons?: string | null;
    executed?: boolean;
    objectiveAchieved?: boolean | null;
}

export interface MeetingListFilters {
    projectId?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
}

async function assertOwnedProject(projectId: string | null | undefined, userId: number) {
    if (!projectId) return;

    const project = await getProjectById(projectId);
    if (!project || project.userId !== userId) {
        throw new BadRequestError400("Project not found");
    }
}

function blankToNull(value: string | null): string | null {
    if (value === null) return null;
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
}

function qualificationColumns(input: MeetingWriteInput): Partial<NewMeeting> {
    const columns: Partial<NewMeeting> = {};

    if (input.summary !== undefined) columns.summary = blankToNull(input.summary);
    if (input.lessons !== undefined) columns.lessons = blankToNull(input.lessons);
    if (input.executed !== undefined) columns.executed = input.executed;
    if (input.objectiveAchieved !== undefined) columns.objectiveAchieved = input.objectiveAchieved;
    if (input.objectiveAchieved === true || input.objectiveAchieved === false) {
        columns.executed = true;
    }

    return columns;
}

function parseMeetingDate(value: string): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new BadRequestError400("Invalid date");
    }
    return date;
}

function cleanIssues(items: { id?: number; name: string; color?: string }[] | undefined) {
    if (!items) return [];

    return items
        .filter((item) => item.name.trim())
        .map((item) => ({
            id: item.id,
            name: item.name.trim(),
            color: item.color ?? "#f5f5f4",
        }));
}

function uniqueIds(ids: string[]): string[] {
    return [...new Set(ids)];
}

const LIMA = "America/Lima";

function formatMeetingStamp(date: Date): string {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: LIMA,
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    }).formatToParts(date);

    const part = (type: Intl.DateTimeFormatPartTypes) =>
        parts.find((item) => item.type === type)?.value ?? "";

    return `${part("day")}/${part("month")}/${part("year")} ${part("hour")}:${part("minute")}:${part("second")} ${part("dayPeriod").toUpperCase()}`;
}

export function nextStepLabels(title: string, date: Date, projectName: string, objective: string) {
    const stamp = formatMeetingStamp(date);
    const prefix = "Reunión ";
    const suffix = ` ${stamp}`;
    const room = 100 - prefix.length - suffix.length;
    const trimmedTitle = room > 0 ? title.trim().slice(0, room) : "";
    const responsible = `${prefix}${trimmedTitle}${suffix}`.slice(0, 100);

    return { responsible, tags: nextStepTags(projectName, objective) };
}

function keptNextSteps(steps: MeetingNextStepInput[]) {
    return steps
        .map((step) => ({
            logId: step.logId,
            description: step.description.trim(),
        }))
        .filter((step) => step.description.length > 0);
}

function assertNextSteps(steps: MeetingNextStepInput[] | undefined, projectId: string | null) {
    if (!steps) return;

    const kept = keptNextSteps(steps);
    if (kept.some((step) => step.description.length < 2)) {
        throw new BadRequestError400("Next step description must be at least 2 characters");
    }
    if (kept.length && !projectId) {
        throw new BadRequestError400("Project is required for next steps");
    }
}

function assertNextStepIds(
    steps: MeetingNextStepInput[] | undefined,
    linked: { id: string; source: LogMeetingSource }[],
) {
    if (!steps) return;

    const allowed = new Set(
        linked.filter((log) => log.source === "meeting").map((log) => log.id),
    );

    for (const step of steps) {
        if (step.logId && step.description.trim() && !allowed.has(step.logId)) {
            throw new BadRequestError400("Next step log not found");
        }
    }
}

function startOfDay(dateStr: string): Date {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function startOfNextDay(dateStr: string): Date {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day + 1);
}

type MeetingDb = typeof db;

async function assertOwnedCards(cardIds: string[], userId: number, client: MeetingDb = db) {
    const ids = uniqueIds(cardIds);
    if (!ids.length) return;

    const rows = await client.select({ id: cards.id }).from(cards)
        .where(and(eq(cards.userId, userId), inArray(cards.id, ids)));

    if (rows.length !== ids.length) {
        throw new BadRequestError400("Card not found");
    }
}

async function assertOwnedLogs(logIds: string[], userId: number, client: MeetingDb = db) {
    const ids = uniqueIds(logIds);
    if (!ids.length) return;

    const rows = await client.select({ id: logs.id }).from(logs)
        .where(and(eq(logs.userId, userId), inArray(logs.id, ids)));

    if (rows.length !== ids.length) {
        throw new BadRequestError400("Log not found");
    }
}

async function syncCardLinks(meetingId: string, userId: number, cardIds: string[], client: MeetingDb = db) {
    const nextIds = uniqueIds(cardIds);
    await assertOwnedCards(nextIds, userId, client);

    const existing = await client.select().from(cardMeetings)
        .where(eq(cardMeetings.meetingId, meetingId));

    const existingIds = new Set(existing.map((row) => row.cardId));
    const next = new Set(nextIds);

    const toDelete = existing.filter((row) => !next.has(row.cardId)).map((row) => row.cardId);
    const toInsert = nextIds.filter((id) => !existingIds.has(id));

    if (toDelete.length) {
        await client.delete(cardMeetings)
            .where(and(eq(cardMeetings.meetingId, meetingId), inArray(cardMeetings.cardId, toDelete)));
    }

    if (toInsert.length) {
        await client.insert(cardMeetings).values(
            toInsert.map((cardId) => ({ cardId, meetingId }))
        );
    }
}

async function syncLogLinks(meetingId: string, userId: number, logLinks: MeetingLogLinkInput[], client: MeetingDb = db) {
    const uniqueLinks = new Map<string, LogMeetingSource>();
    for (const link of logLinks) {
        if (!uniqueLinks.has(link.logId)) {
            uniqueLinks.set(link.logId, link.source);
        }
    }

    const nextIds = [...uniqueLinks.keys()];
    await assertOwnedLogs(nextIds, userId, client);

    const existing = await client.select().from(logMeetings)
        .where(eq(logMeetings.meetingId, meetingId));

    const existingByLog = new Map(existing.map((row) => [row.logId, row]));
    const next = new Set(nextIds);

    const toDelete = existing
        .filter((row) => row.source === "log" && !next.has(row.logId))
        .map((row) => row.logId);
    const toInsert = nextIds.filter((id) => !existingByLog.has(id));

    if (toDelete.length) {
        await client.delete(logMeetings)
            .where(and(eq(logMeetings.meetingId, meetingId), inArray(logMeetings.logId, toDelete)));
    }

    if (toInsert.length) {
        await client.insert(logMeetings).values(
            toInsert.map((logId) => ({
                logId,
                meetingId,
                source: uniqueLinks.get(logId) ?? "log",
            }))
        );
    }
}

async function syncNextSteps(
    client: MeetingDb,
    meetingId: string,
    userId: number,
    steps: MeetingNextStepInput[] | undefined,
    meeting: { title: string; date: Date; projectId: string | null; projectName: string; objective: string },
) {
    if (steps === undefined) return;

    const kept = keptNextSteps(steps);
    const existing = await client.select({ logId: logMeetings.logId }).from(logMeetings)
        .where(and(eq(logMeetings.meetingId, meetingId), eq(logMeetings.source, "meeting")));

    const existingIds = new Set(existing.map((row) => row.logId));
    const withId = kept.filter((step): step is { logId: string; description: string } => Boolean(step.logId));
    const withoutId = kept.filter((step) => !step.logId);

    for (const step of withId) {
        if (!existingIds.has(step.logId)) {
            throw new BadRequestError400("Next step log not found");
        }
    }

    const labels = nextStepLabels(meeting.title, meeting.date, meeting.projectName, meeting.objective);

    if ((withId.length || withoutId.length) && !meeting.projectId) {
        throw new BadRequestError400("Project is required for next steps");
    }

    const projectId = meeting.projectId ?? "";

    for (const step of withId) {
        await client.update(logs).set({
            description: step.description,
            responsible: labels.responsible,
            tags: labels.tags,
            projectId,
        }).where(and(eq(logs.id, step.logId), eq(logs.userId, userId)));
    }

    if (withoutId.length) {
        const created = await client.insert(logs).values(withoutId.map((step) => ({
            userId,
            projectId,
            description: step.description,
            responsible: labels.responsible,
            tags: labels.tags,
            completed: null,
            comment: null,
        }))).returning({ id: logs.id });

        await client.insert(logMeetings).values(created.map((row) => ({
            logId: row.id,
            meetingId,
            source: "meeting" as const,
        })));
    }

    const keepIds = new Set(withId.map((step) => step.logId));
    const removeIds = [...existingIds].filter((id) => !keepIds.has(id));

    if (removeIds.length) {
        await client.delete(logMeetings).where(and(
            eq(logMeetings.meetingId, meetingId),
            inArray(logMeetings.logId, removeIds),
        ));
        await client.delete(logs).where(and(eq(logs.userId, userId), inArray(logs.id, removeIds)));
    }
}

async function linkedCards(meetingId: string) {
    const rows = await db
        .select({
            id: cards.id,
            name: cards.name,
            description: cards.description,
            color: cards.color,
            isPrompt: cards.isPrompt,
            flMeeting: cards.flMeeting,
            projectId: cards.projectId,
            projectName: projects.name,
            projectColor: projects.color,
        })
        .from(cardMeetings)
        .innerJoin(cards, eq(cardMeetings.cardId, cards.id))
        .leftJoin(projects, eq(cards.projectId, projects.id))
        .where(eq(cardMeetings.meetingId, meetingId));

    return rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        color: row.color,
        isPrompt: row.isPrompt,
        flMeeting: row.flMeeting,
        projectId: row.projectId,
        project: row.projectId && row.projectName && row.projectColor
            ? { name: row.projectName, color: row.projectColor }
            : null,
    }));
}

async function linkedIssues(meetingId: string) {
    const rows = await db.select({
        id: issues.id,
        name: issues.name,
        color: issues.color,
    })
        .from(issues)
        .where(eq(issues.meetingId, meetingId))
        .orderBy(asc(issues.id));

    return rows;
}

async function syncIssues(
    meetingId: string,
    items: { id?: number; name: string; color?: string }[] | undefined,
    client: MeetingDb = db,
) {
    const next = cleanIssues(items);

    await client.delete(issues).where(eq(issues.meetingId, meetingId));

    if (!next.length) return;

    await client.insert(issues).values(
        next.map((item) => ({
            meetingId,
            name: item.name,
            color: item.color,
        }))
    );
}

async function linkedLogs(meetingId: string) {
    const rows = await db
        .select({
            id: logs.id,
            description: logs.description,
            source: logMeetings.source,
        })
        .from(logMeetings)
        .innerJoin(logs, eq(logMeetings.logId, logs.id))
        .where(eq(logMeetings.meetingId, meetingId))
        .orderBy(asc(logs.createdAt), asc(logs.id));

    return rows.map((row) => ({
        id: row.id,
        description: row.description,
        source: row.source,
    }));
}

async function withLinks<T extends { id: string }>(meeting: T) {
    const [cardsLinked, logsLinked, issuesLinked] = await Promise.all([
        linkedCards(meeting.id),
        linkedLogs(meeting.id),
        linkedIssues(meeting.id),
    ]);

    return {
        ...meeting,
        cards: cardsLinked,
        logs: logsLinked,
        issues: issuesLinked,
    };
}

export async function getMeetingByIdForUser(id: string, userId: number) {
    const [meeting] = await db.select().from(meetings)
        .where(and(eq(meetings.id, id), eq(meetings.userId, userId)));

    if (!meeting) {
        throw new NotFoundError404("Meeting not found");
    }

    return withLinks(meeting);
}

export async function createMeeting(userId: number, input: MeetingWriteInput) {
    if (!input.title?.trim() || !input.date || input.estimatedDuration === undefined) {
        throw new BadRequestError400("Title, date and duration are required");
    }

    const title = input.title.trim();
    const date = parseMeetingDate(input.date);
    const projectId = input.projectId ?? null;

    await assertOwnedProject(projectId, userId);
    await assertOwnedCards(input.cardIds ?? [], userId);
    await assertOwnedLogs((input.logLinks ?? []).map((link) => link.logId), userId);
    assertNextSteps(input.nextSteps, projectId);
    assertNextStepIds(input.nextSteps, []);

    const projectName = projectId ? (await getProjectById(projectId))?.name ?? "" : "";

    const meeting = await db.transaction(async (tx) => {
        const client = tx as unknown as MeetingDb;

        const [created] = await client.insert(meetings).values({
            userId,
            projectId,
            title,
            date,
            estimatedDuration: input.estimatedDuration!,
            topicStatus: input.topicStatus ?? "",
            objective: input.objective ?? "",
            participants: input.participants ?? "",
            color: input.color ?? "#f5f5f4",
            ...qualificationColumns(input),
        }).returning();

        await syncIssues(created.id, input.issues, client);
        await syncCardLinks(created.id, userId, input.cardIds ?? [], client);
        await syncLogLinks(created.id, userId, input.logLinks ?? [], client);
        await syncNextSteps(client, created.id, userId, input.nextSteps, {
            title,
            date,
            projectId,
            projectName,
            objective: input.objective ?? "",
        });

        return created;
    });

    return withLinks(meeting);
}

export async function updateMeeting(id: string, userId: number, changes: MeetingWriteInput) {
    const current = await getMeetingByIdForUser(id, userId);

    if (changes.projectId !== undefined) {
        await assertOwnedProject(changes.projectId, userId);
    }

    const projectId = changes.projectId !== undefined ? changes.projectId : current.projectId;
    const title = changes.title !== undefined ? changes.title.trim() : current.title;
    const date = changes.date !== undefined ? parseMeetingDate(changes.date) : new Date(current.date);

    assertNextSteps(changes.nextSteps, projectId);
    assertNextStepIds(changes.nextSteps, current.logs);

    const projectName = projectId ? (await getProjectById(projectId))?.name ?? "" : "";
    const objective = changes.objective !== undefined ? changes.objective : current.objective;

    const payload: Partial<NewMeeting> = {};

    if (changes.title !== undefined) payload.title = changes.title.trim();
    if (changes.date !== undefined) payload.date = parseMeetingDate(changes.date);
    if (changes.estimatedDuration !== undefined) payload.estimatedDuration = changes.estimatedDuration;
    if (changes.topicStatus !== undefined) payload.topicStatus = changes.topicStatus;
    if (changes.objective !== undefined) payload.objective = changes.objective;
    if (changes.participants !== undefined) payload.participants = changes.participants;
    if (changes.color !== undefined) payload.color = changes.color;
    if (changes.projectId !== undefined) payload.projectId = changes.projectId;
    Object.assign(payload, qualificationColumns(changes));

    await db.transaction(async (tx) => {
        const client = tx as unknown as MeetingDb;

        if (Object.keys(payload).length) {
            await client.update(meetings)
                .set(payload)
                .where(and(eq(meetings.id, id), eq(meetings.userId, userId)));
        }

        if (changes.issues !== undefined) {
            await syncIssues(id, changes.issues, client);
        }

        if (changes.cardIds !== undefined) {
            await syncCardLinks(id, userId, changes.cardIds, client);
        }

        if (changes.logLinks !== undefined) {
            await syncLogLinks(id, userId, changes.logLinks, client);
        }

        await syncNextSteps(client, id, userId, changes.nextSteps, {
            title,
            date,
            projectId,
            projectName,
            objective,
        });
    });

    return getMeetingByIdForUser(id, userId);
}

export async function deleteMeeting(id: string, userId: number) {
    await getMeetingByIdForUser(id, userId);

    await db.update(requirements)
        .set({ meetingId: null })
        .where(and(eq(requirements.meetingId, id), eq(requirements.userId, userId)));

    await db.update(tasks)
        .set({ meetingId: null })
        .where(and(eq(tasks.meetingId, id), eq(tasks.userId, userId)));

    await db.delete(issues).where(eq(issues.meetingId, id));
    await db.delete(cardMeetings).where(eq(cardMeetings.meetingId, id));
    await db.delete(logMeetings).where(eq(logMeetings.meetingId, id));

    const [meeting] = await db.delete(meetings)
        .where(and(eq(meetings.id, id), eq(meetings.userId, userId)))
        .returning();

    return meeting;
}

export async function listMeetings(userId: number, filters: MeetingListFilters = {}) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit >= 1 ? Math.min(filters.limit, 24) : 12;

    const where = and(
        eq(meetings.userId, userId),
        filters.projectId === "null" ? isNull(meetings.projectId) : undefined,
        filters.projectId && filters.projectId !== "null"
            ? eq(meetings.projectId, filters.projectId)
            : undefined,
        filters.from ? gte(meetings.date, startOfDay(filters.from)) : undefined,
        filters.to ? lt(meetings.date, startOfNextDay(filters.to)) : undefined,
    );

    const [totalRow] = await db.select({ value: count() }).from(meetings).where(where);

    const rows = await db.select({
        id: meetings.id,
        title: meetings.title,
        date: meetings.date,
        estimatedDuration: meetings.estimatedDuration,
        participants: meetings.participants,
        color: meetings.color,
        projectId: meetings.projectId,
        projectName: projects.name,
        projectColor: projects.color,
        executed: meetings.executed,
        objectiveAchieved: meetings.objectiveAchieved,
    })
        .from(meetings)
        .leftJoin(projects, eq(meetings.projectId, projects.id))
        .where(where)
        .orderBy(desc(meetings.date))
        .limit(limit)
        .offset((page - 1) * limit);

    const items = rows.map((row) => ({
        id: row.id,
        title: row.title,
        date: row.date,
        estimatedDuration: row.estimatedDuration,
        participants: row.participants,
        color: row.color,
        projectId: row.projectId,
        project: row.projectId && row.projectName && row.projectColor
            ? { name: row.projectName, color: row.projectColor }
            : null,
        executed: row.executed,
        objectiveAchieved: row.objectiveAchieved,
    }));

    return {
        items,
        page,
        limit,
        total: totalRow?.value ?? 0,
    };
}
