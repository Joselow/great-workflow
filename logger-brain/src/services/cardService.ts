import { and, count, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";

import { db } from '../db/index.js';
import { cards, type CardSection, type NewCard } from "../db/schemas/cards.js";
import { projects } from "../db/schemas/projects.js";
import { getProjectById } from "./projectService.js";
import { BadRequestError400 } from "../errors/BadRequestError400.js";
import { NotFoundError404 } from "../errors/NotFoundError404.js";

interface CardWriteInput {
    name?: string;
    description?: string;
    color?: string;
    isPrompt?: boolean;
    flMeeting?: boolean;
    projectId?: string | null;
    sections?: CardSection[];
}

export interface CardListFilters {
    q?: string;
    projectId?: string;
    isPrompt?: boolean;
    flMeeting?: boolean;
    page?: number;
    limit?: number;
}

async function assertOwnedProject(projectId: string | null | undefined, userId: number) {
    if (!projectId) return;

    const project = await getProjectById(projectId);
    if (!project || project.userId !== userId) {
        throw new BadRequestError400('Project not found');
    }
}

function likePattern(raw: string): string {
    const escaped = raw.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
    return `%${escaped}%`;
}

function listWhere(userId: number, filters: CardListFilters) {
    const q = filters.q?.trim();
    const pattern = q ? likePattern(q) : undefined;

    const textMatch = pattern
        ? or(
            ilike(cards.name, pattern),
            ilike(cards.description, pattern),
            sql`EXISTS (
                SELECT 1 FROM jsonb_array_elements(${cards.sections}) AS s
                WHERE s->>'title' ILIKE ${pattern}
                   OR s->>'description' ILIKE ${pattern}
            )`
        )
        : undefined;

    return and(
        eq(cards.userId, userId),
        filters.projectId === 'null' ? isNull(cards.projectId) : undefined,
        filters.projectId && filters.projectId !== 'null'
            ? eq(cards.projectId, filters.projectId)
            : undefined,
        filters.isPrompt !== undefined ? eq(cards.isPrompt, filters.isPrompt) : undefined,
        filters.flMeeting !== undefined ? eq(cards.flMeeting, filters.flMeeting) : undefined,
        textMatch,
    );
}

async function projectSummary(projectId: string | null) {
    if (!projectId) return null;

    const owned = await getProjectById(projectId);
    if (!owned) return null;

    return { name: owned.name, color: owned.color };
}

export async function createCard(userId: number, input: CardWriteInput) {
    await assertOwnedProject(input.projectId, userId);

    const isPrompt = input.isPrompt ?? false;

    const [card] = await db.insert(cards).values({
        userId,
        projectId: input.projectId ?? null,
        meetingId: null,
        name: input.name ?? '',
        description: input.description ?? '',
        color: input.color ?? '#f5f5f4',
        isPrompt,
        flMeeting: input.flMeeting ?? false,
        sections: isPrompt ? [] : (input.sections ?? []),
    }).returning();

    return card;
}

export async function getCardByIdForUser(id: string, userId: number) {
    const [card] = await db.select().from(cards)
        .where(and(eq(cards.id, id), eq(cards.userId, userId)));

    if (!card) {
        throw new NotFoundError404('Card not found');
    }

    return card;
}

export async function updateCard(id: string, userId: number, changes: CardWriteInput) {
    const existing = await getCardByIdForUser(id, userId);

    if (changes.projectId !== undefined) {
        await assertOwnedProject(changes.projectId, userId);
    }

    const nextIsPrompt = changes.isPrompt ?? existing.isPrompt;
    const nextSections = nextIsPrompt ? [] : (changes.sections ?? existing.sections);

    const payload: Partial<NewCard> = {
        isPrompt: nextIsPrompt,
        sections: nextSections,
    };

    if (changes.name !== undefined) payload.name = changes.name;
    if (changes.description !== undefined) payload.description = changes.description;
    if (changes.color !== undefined) payload.color = changes.color;
    if (changes.projectId !== undefined) payload.projectId = changes.projectId;
    if (changes.flMeeting !== undefined) payload.flMeeting = changes.flMeeting;

    const [card] = await db.update(cards)
        .set(payload)
        .where(and(eq(cards.id, id), eq(cards.userId, userId)))
        .returning();

    return card;
}

export async function getPublicCard(id: string) {
    const [card] = await db.select().from(cards).where(eq(cards.id, id));

    if (!card) {
        throw new NotFoundError404('Card not found');
    }

    return {
        id: card.id,
        name: card.name,
        description: card.description,
        color: card.color,
        isPrompt: card.isPrompt,
        flMeeting: card.flMeeting,
        sections: card.sections,
        project: await projectSummary(card.projectId),
    };
}

export async function listCards(userId: number, filters: CardListFilters = {}) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit >= 1 ? Math.min(filters.limit, 24) : 6;
    const where = listWhere(userId, filters);

    const [totalRow] = await db.select({ value: count() }).from(cards).where(where);

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
        .from(cards)
        .leftJoin(projects, eq(cards.projectId, projects.id))
        .where(where)
        .orderBy(desc(cards.updatedAt))
        .limit(limit)
        .offset((page - 1) * limit);

    const items = rows.map((row) => ({
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

    return {
        items,
        page,
        limit,
        total: totalRow?.value ?? 0,
    };
}
