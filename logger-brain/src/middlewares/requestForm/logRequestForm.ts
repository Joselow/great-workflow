import type { NextFunction, Request, Response } from "express";

import { verifyCreateLogSchema, verifyLogQuerySchema, verifyUpdateLogSchema } from "../../validations/logValidation.js";
import { formatValidationErrors } from "../../utils/formatValidationError.js";
import { BadRequestError400 } from "../../errors/BadRequestError400.js";


export const storeLogRequestForm = (req: Request, res: Response, next: NextFunction): void => {
    const { id } = req.params
    const payload = req.body;

    if ('meetingId' in payload || 'typeMeetingLink' in payload) {
        throw new BadRequestError400('The given data was invalid', {
            meetingId: ['Use log_meetings links instead of meetingId'],
        })
    }

    const validated = id
        ? verifyUpdateLogSchema(payload)
        : verifyCreateLogSchema(payload);

    if (!validated.success) {
        const errors = formatValidationErrors(validated.error)
        throw new BadRequestError400('The given data was invalid', errors)
    }

    next();
};

export const logQueryRequestForm = (req: Request, _res: Response, next: NextFunction): void => {
    const { projectId, completed, from, to } = req.query;

    const validated = verifyLogQuerySchema({
        projectId,
        completed,
        from,
        to,
    });

    if (!validated.success) {
        const errors = formatValidationErrors(validated.error);
        throw new BadRequestError400('The given data was invalid', errors);
    }

    next();
};