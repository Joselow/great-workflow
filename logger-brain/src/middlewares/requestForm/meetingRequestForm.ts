import type { NextFunction, Request, Response } from "express";

import {
    verifyCreateMeetingSchema,
    verifyMeetingListQuerySchema,
    verifyUpdateMeetingSchema,
} from "../../validations/meetingValidation.js";
import { formatValidationErrors } from "../../utils/formatValidationError.js";
import { BadRequestError400 } from "../../errors/BadRequestError400.js";

export const storeMeetingRequestForm = (req: Request, _res: Response, next: NextFunction): void => {
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
        additionalInfo,
        platform,
        meetingUrl,
        accessDetails,
    } = req.body;

    const payload = {
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
        additionalInfo,
        platform,
        meetingUrl,
        accessDetails,
    };

    const validated = id
        ? verifyUpdateMeetingSchema(payload)
        : verifyCreateMeetingSchema(payload);

    if (!validated.success) {
        const errors = formatValidationErrors(validated.error);
        throw new BadRequestError400("The given data was invalid", errors);
    }

    req.body = validated.data;
    next();
};

export const meetingListQueryRequestForm = (req: Request, _res: Response, next: NextFunction): void => {
    const { projectId, from, to, page, limit } = req.query;

    const validated = verifyMeetingListQuerySchema({
        projectId,
        from,
        to,
        page,
        limit,
    });

    if (!validated.success) {
        const errors = formatValidationErrors(validated.error);
        throw new BadRequestError400("The given data was invalid", errors);
    }

    next();
};
