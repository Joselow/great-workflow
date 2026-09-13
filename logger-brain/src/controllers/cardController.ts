import type { Request, Response } from "express";

import * as cardService from "../services/cardService.js";
import { getUserPayload } from "../helpers/authHelpers.js";
import { simpleSuccess } from "../utils/responses.js";

export const createCard = async (req: Request, res: Response) => {
    const user = getUserPayload(req);
    const { name, description, color, isPrompt, flMeeting, projectId, sections } = req.body;

    const card = await cardService.createCard(user.id, {
        name,
        description,
        color,
        isPrompt,
        flMeeting,
        projectId,
        sections,
    });

    return simpleSuccess(res, 201, card);
};

export const getCardById = async (req: Request, res: Response) => {
    const user = getUserPayload(req);
    const { id } = req.params;
    const card = await cardService.getCardByIdForUser(id, user.id);
    return simpleSuccess(res, 200, card);
};

export const updateCard = async (req: Request, res: Response) => {
    const user = getUserPayload(req);
    const { id } = req.params;
    const { name, description, color, isPrompt, flMeeting, projectId, sections } = req.body;

    const card = await cardService.updateCard(id, user.id, {
        name,
        description,
        color,
        isPrompt,
        flMeeting,
        projectId,
        sections,
    });

    return simpleSuccess(res, 200, card);
};

export const listCards = async (req: Request, res: Response) => {
    const user = getUserPayload(req);
    const q = typeof req.query.q === 'string' ? req.query.q : undefined;
    const projectId = typeof req.query.projectId === 'string' ? req.query.projectId : undefined;
    const isPromptQuery = req.query.isPrompt;
    const isPrompt = isPromptQuery === 'true' ? true : isPromptQuery === 'false' ? false : undefined;
    const flMeetingQuery = req.query.flMeeting;
    const flMeeting = flMeetingQuery === 'true' ? true : flMeetingQuery === 'false' ? false : undefined;
    const page = typeof req.query.page === 'string' ? Number(req.query.page) : undefined;
    const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined;

    const data = await cardService.listCards(user.id, {
        q,
        projectId,
        isPrompt,
        flMeeting,
        page,
        limit,
    });

    return simpleSuccess(res, 200, data);
};

export const getPublicCard = async (req: Request, res: Response) => {
    const { id } = req.params;
    const card = await cardService.getPublicCard(id);
    return simpleSuccess(res, 200, card);
};
