import { and, asc, eq } from 'drizzle-orm';

import { db } from '../db/index.js';
import { actionTemplates, type NewActionTemplate } from '../db/schemas/actionTemplates.js';
import { cards } from '../db/schemas/cards.js';
import { BadRequestError400 } from '../errors/BadRequestError400.js';
import { NotFoundError404 } from '../errors/NotFoundError404.js';

export type ActionTemplateModule = 'all' | 'log' | 'meeting' | 'requirement' | 'task';

export interface ActionTemplateWriteInput {
    module: ActionTemplateModule;
    name: string;
    action?: string | null;
    template?: string;
    color: string;
    isActive?: boolean;
    cardId?: string | null;
}

export interface ActionTemplateCardSummary {
    id: string;
    name: string;
    color: string;
    description: string;
}

export interface ActionTemplatePublic {
    id: number;
    module: string;
    name: string;
    action: string | null;
    template: string;
    color: string;
    isActive: boolean;
    cardId: string | null;
    card: ActionTemplateCardSummary | null;
    createdAt: Date;
    updatedAt: Date;
}

type CardLinkRow = {
    id: string;
    name: string;
    color: string;
    description: string;
    isPrompt: boolean;
    userId: number;
};

type QueryExecutor = Pick<typeof db, 'update'>;

function cardSummary(card: CardLinkRow | null, ownerId: number): ActionTemplateCardSummary | null {
    if (!card || card.userId !== ownerId || !card.isPrompt) return null;

    return {
        id: card.id,
        name: card.name,
        color: card.color,
        description: card.description,
    };
}

async function resolveContent(userId: number, input: ActionTemplateWriteInput) {
    if (input.cardId) {
        const [card] = await db.select({
            id: cards.id,
            isPrompt: cards.isPrompt,
        }).from(cards).where(and(eq(cards.id, input.cardId), eq(cards.userId, userId)));

        if (!card || !card.isPrompt) {
            throw new BadRequestError400('Card not found');
        }

        return { cardId: card.id, template: '' };
    }

    const template = input.template?.trim() ?? '';
    if (!template) {
        throw new BadRequestError400('Template is required');
    }

    return { cardId: null, template };
}

function toPublic(
    row: {
        id: number;
        module: string;
        name: string;
        action: string | null;
        template: string;
        color: string;
        isActive: boolean;
        cardId: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
    },
    card: CardLinkRow | null,
): ActionTemplatePublic {
    return {
        id: row.id,
        module: row.module,
        name: row.name,
        action: row.action,
        template: row.template,
        color: row.color,
        isActive: row.isActive,
        cardId: row.cardId,
        card: cardSummary(card, row.userId),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}

const listSelection = {
    id: actionTemplates.id,
    userId: actionTemplates.userId,
    module: actionTemplates.module,
    name: actionTemplates.name,
    action: actionTemplates.action,
    template: actionTemplates.template,
    color: actionTemplates.color,
    isActive: actionTemplates.isActive,
    cardId: actionTemplates.cardId,
    createdAt: actionTemplates.createdAt,
    updatedAt: actionTemplates.updatedAt,
    linkedId: cards.id,
    linkedName: cards.name,
    linkedColor: cards.color,
    linkedDescription: cards.description,
    linkedIsPrompt: cards.isPrompt,
    linkedUserId: cards.userId,
};

function rowCard(row: {
    linkedId: string | null;
    linkedName: string | null;
    linkedColor: string | null;
    linkedDescription: string | null;
    linkedIsPrompt: boolean | null;
    linkedUserId: number | null;
}): CardLinkRow | null {
    if (!row.linkedId || row.linkedName == null || row.linkedColor == null || row.linkedDescription == null || row.linkedIsPrompt == null || row.linkedUserId == null) {
        return null;
    }

    return {
        id: row.linkedId,
        name: row.linkedName,
        color: row.linkedColor,
        description: row.linkedDescription,
        isPrompt: row.linkedIsPrompt,
        userId: row.linkedUserId,
    };
}

export async function listActionTemplates(userId: number, module?: ActionTemplateModule) {
    const rows = await db.select(listSelection)
        .from(actionTemplates)
        .leftJoin(cards, eq(cards.id, actionTemplates.cardId))
        .where(and(
            eq(actionTemplates.userId, userId),
            module ? eq(actionTemplates.module, module) : undefined,
        ))
        .orderBy(asc(actionTemplates.createdAt));

    return rows.map((row) => toPublic(row, rowCard(row)));
}

export async function getActionTemplateByIdForUser(id: number, userId: number) {
    const [row] = await db.select(listSelection)
        .from(actionTemplates)
        .leftJoin(cards, eq(cards.id, actionTemplates.cardId))
        .where(and(eq(actionTemplates.id, id), eq(actionTemplates.userId, userId)));

    if (!row) {
        throw new NotFoundError404('Action template not found');
    }

    return toPublic(row, rowCard(row));
}

export async function createActionTemplate(userId: number, input: ActionTemplateWriteInput) {
    const content = await resolveContent(userId, input);

    const [created] = await db.insert(actionTemplates).values({
        userId,
        module: input.module,
        name: input.name.trim(),
        action: input.action ?? null,
        template: content.template,
        color: input.color,
        isActive: input.isActive ?? true,
        cardId: content.cardId,
    } satisfies NewActionTemplate).returning({ id: actionTemplates.id });

    return getActionTemplateByIdForUser(created.id, userId);
}

export async function updateActionTemplate(id: number, userId: number, input: ActionTemplateWriteInput) {
    const existing = await getActionTemplateByIdForUser(id, userId);
    const content = await resolveContent(userId, input);

    const [updated] = await db.update(actionTemplates)
        .set({
            module: input.module,
            name: input.name.trim(),
            action: input.action ?? null,
            template: content.template,
            color: input.color,
            isActive: input.isActive ?? existing.isActive,
            cardId: content.cardId,
            updatedAt: new Date(),
        })
        .where(and(eq(actionTemplates.id, id), eq(actionTemplates.userId, userId)))
        .returning({ id: actionTemplates.id });

    if (!updated) {
        throw new NotFoundError404('Action template not found');
    }

    return getActionTemplateByIdForUser(updated.id, userId);
}

export async function deleteActionTemplate(id: number, userId: number) {
    const [deleted] = await db.delete(actionTemplates)
        .where(and(eq(actionTemplates.id, id), eq(actionTemplates.userId, userId)))
        .returning({ id: actionTemplates.id });

    if (!deleted) {
        throw new NotFoundError404('Action template not found');
    }
}

export async function clearActionTemplateCardLinks(
    cardId: string,
    userId: number,
    executor: QueryExecutor = db,
) {
    await executor.update(actionTemplates)
        .set({ cardId: null })
        .where(and(eq(actionTemplates.cardId, cardId), eq(actionTemplates.userId, userId)));
}
