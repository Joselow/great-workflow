import type { Request, Response } from "express";

import * as meetingService from "../services/meetingService.js";
import { getUserPayload } from "../helpers/authHelpers.js";
import { simpleSuccess } from "../utils/responses.js";

export const createMeeting = async (req: Request, res: Response) => {
    const user = getUserPayload(req);
    const {
        title,
        date,
        estimatedDuration,
        topicStatus,
        objective,
        participants,
        color,
        projectId,
        issues,
        cardIds,
        logLinks,
        nextSteps,
        summary,
        lessons,
        executed,
        objectiveAchieved,
    } = req.body;

    const meeting = await meetingService.createMeeting(user.id, {
        title,
        date,
        estimatedDuration,
        topicStatus,
        objective,
        participants,
        color,
        projectId,
        issues,
        cardIds,
        logLinks,
        nextSteps,
        summary,
        lessons,
        executed,
        objectiveAchieved,
    });

    return simpleSuccess(res, 201, meeting);
};

export const getMeetingById = async (req: Request, res: Response) => {
    const user = getUserPayload(req);
    const { id } = req.params;
    const meeting = await meetingService.getMeetingByIdForUser(id, user.id);
    return simpleSuccess(res, 200, meeting);
};

export const updateMeeting = async (req: Request, res: Response) => {
    const user = getUserPayload(req);
    const { id } = req.params;
    const {
        title,
        date,
        estimatedDuration,
        topicStatus,
        objective,
        participants,
        color,
        projectId,
        issues,
        cardIds,
        logLinks,
        nextSteps,
        summary,
        lessons,
        executed,
        objectiveAchieved,
    } = req.body;

    const meeting = await meetingService.updateMeeting(id, user.id, {
        title,
        date,
        estimatedDuration,
        topicStatus,
        objective,
        participants,
        color,
        projectId,
        issues,
        cardIds,
        logLinks,
        nextSteps,
        summary,
        lessons,
        executed,
        objectiveAchieved,
    });

    return simpleSuccess(res, 200, meeting);
};

export const deleteMeeting = async (req: Request, res: Response) => {
    const user = getUserPayload(req);
    const { id } = req.params;

    await meetingService.deleteMeeting(id, user.id);

    return simpleSuccess(res, 200, { message: "Meeting deleted successfully" });
};

export const listMeetings = async (req: Request, res: Response) => {
    const user = getUserPayload(req);
    const projectId = typeof req.query.projectId === "string" ? req.query.projectId : undefined;
    const from = typeof req.query.from === "string" ? req.query.from : undefined;
    const to = typeof req.query.to === "string" ? req.query.to : undefined;
    const page = typeof req.query.page === "string" ? Number(req.query.page) : undefined;
    const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;

    const data = await meetingService.listMeetings(user.id, {
        projectId,
        from,
        to,
        page,
        limit,
    });

    return simpleSuccess(res, 200, data);
};
