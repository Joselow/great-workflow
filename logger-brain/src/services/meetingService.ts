import { and, asc, count, desc, eq, gte, inArray, isNull, lt } from "drizzle-orm";

import { db } from "../db/index.js";
import { meetings, type NewMeeting } from "../db/schemas/meetings.js";
import { cardMeetings } from "../db/schemas/cardMeetings.js";
import { logMeetings, type LogMeetingSource } from "../db/schemas/logMeetings.js";
import { issues } from "../db/schemas/issues.js";
import { cards } from "../db/schemas/cards.js";
import { logs } from "../db/schemas/logs.js";
import { projects } from "../db/schemas/projects.js";
import { getProjectById } from "./projectService.js";
import { BadRequestError400 } from "../errors/BadRequestError400.js";
import { NotFoundError404 } from "../errors/NotFoundError404.js";

export interface MeetingLogLinkInput {
    logId: string;
    source: LogMeetingSource;
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

function startOfDay(dateStr: string): Date {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function startOfNextDay(dateStr: string): Date {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day + 1);
}

async function assertOwnedCards(cardIds: string[], userId: number) {
    const ids = uniqueIds(cardIds);
    if (!ids.length) return;

    const rows = await db.select({ id: cards.id }).from(cards)
        .where(and(eq(cards.userId, userId), inArray(cards.id, ids)));

    if (rows.length !== ids.length) {
        throw new BadRequestError400("Card not found");
    }
}

async function assertOwnedLogs(logIds: string[], userId: number) {
    const ids = uniqueIds(logIds);
    if (!ids.length) return;

    const rows = await db.select({ id: logs.id }).from(logs)
        .where(and(eq(logs.userId, userId), inArray(logs.id, ids)));

    if (rows.length !== ids.length) {
        throw new BadRequestError400("Log not found");
    }
}

async function syncCardLinks(meetingId: string, userId: number, cardIds: string[]) {
    const nextIds = uniqueIds(cardIds);
    await assertOwnedCards(nextIds, userId);

    const existing = await db.select().from(cardMeetings)
        .where(eq(cardMeetings.meetingId, meetingId));

    const existingIds = new Set(existing.map((row) => row.cardId));
    const next = new Set(nextIds);

    const toDelete = existing.filter((row) => !next.has(row.cardId)).map((row) => row.cardId);
    const toInsert = nextIds.filter((id) => !existingIds.has(id));

    if (toDelete.length) {
        await db.delete(cardMeetings)
            .where(and(eq(cardMeetings.meetingId, meetingId), inArray(cardMeetings.cardId, toDelete)));
    }

    if (toInsert.length) {
        await db.insert(cardMeetings).values(
            toInsert.map((cardId) => ({ cardId, meetingId }))
        );
    }
}

async function syncLogLinks(meetingId: string, userId: number, logLinks: MeetingLogLinkInput[]) {
    const uniqueLinks = new Map<string, LogMeetingSource>();
    for (const link of logLinks) {
        if (!uniqueLinks.has(link.logId)) {
            uniqueLinks.set(link.logId, link.source);
        }
    }

    const nextIds = [...uniqueLinks.keys()];
    await assertOwnedLogs(nextIds, userId);

    const existing = await db.select().from(logMeetings)
        .where(eq(logMeetings.meetingId, meetingId));

    const existingByLog = new Map(existing.map((row) => [row.logId, row]));
    const next = new Set(nextIds);

    const toDelete = existing.filter((row) => !next.has(row.logId)).map((row) => row.logId);
    const toInsert = nextIds.filter((id) => !existingByLog.has(id));

    if (toDelete.length) {
        await db.delete(logMeetings)
            .where(and(eq(logMeetings.meetingId, meetingId), inArray(logMeetings.logId, toDelete)));
    }

    if (toInsert.length) {
        await db.insert(logMeetings).values(
            toInsert.map((logId) => ({
                logId,
                meetingId,
                source: uniqueLinks.get(logId) ?? "log",
            }))
        );
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

async function syncIssues(meetingId: string, items: { id?: number; name: string; color?: string }[] | undefined) {
    const next = cleanIssues(items);

    await db.delete(issues).where(eq(issues.meetingId, meetingId));

    if (!next.length) return;

    await db.insert(issues).values(
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
        .where(eq(logMeetings.meetingId, meetingId));

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

    await assertOwnedProject(input.projectId, userId);
    await assertOwnedCards(input.cardIds ?? [], userId);
    await assertOwnedLogs((input.logLinks ?? []).map((link) => link.logId), userId);

    const [meeting] = await db.insert(meetings).values({
        userId,
        projectId: input.projectId ?? null,
        title: input.title.trim(),
        date: parseMeetingDate(input.date),
        estimatedDuration: input.estimatedDuration,
        topicStatus: input.topicStatus ?? "",
        objective: input.objective ?? "",
        participants: input.participants ?? "",
        color: input.color ?? "#f5f5f4",
        ...qualificationColumns(input),
    }).returning();

    await syncIssues(meeting.id, input.issues);
    await syncCardLinks(meeting.id, userId, input.cardIds ?? []);
    await syncLogLinks(meeting.id, userId, input.logLinks ?? []);

    return withLinks(meeting);
}

export async function updateMeeting(id: string, userId: number, changes: MeetingWriteInput) {
    await getMeetingByIdForUser(id, userId);

    if (changes.projectId !== undefined) {
        await assertOwnedProject(changes.projectId, userId);
    }

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

    if (Object.keys(payload).length) {
        await db.update(meetings)
            .set(payload)
            .where(and(eq(meetings.id, id), eq(meetings.userId, userId)));
    }

    if (changes.issues !== undefined) {
        await syncIssues(id, changes.issues);
    }

    if (changes.cardIds !== undefined) {
        await syncCardLinks(id, userId, changes.cardIds);
    }

    if (changes.logLinks !== undefined) {
        await syncLogLinks(id, userId, changes.logLinks);
    }

    return getMeetingByIdForUser(id, userId);
}

export async function deleteMeeting(id: string, userId: number) {
    await getMeetingByIdForUser(id, userId);

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
