import type { NextFunction, Request, Response } from "express";

import { verifyCreateLogSchema, verifyUpdateLogSchema } from "../../validations/logValidation.js";
import { formatValidationErrors } from "../../utils/formatValidationError.js";
import { BadRequestError400 } from "../../errors/BadRequestError400.js";


export const storeLogRequestForm = (req: Request, res: Response, next: NextFunction): void => {
    const { id } = req.params
    const { projectId, meetingId, typeMeetingLink, description, responsible, tags, comment, completed } = req.body;

    const payload = {
        projectId,
        meetingId,
        typeMeetingLink,
        description,
        responsible,
        tags,
        comment,
        completed,
    };

    const validated = id
        ? verifyUpdateLogSchema(payload)
        : verifyCreateLogSchema(payload);

    if (!validated.success) {
        const errors = formatValidationErrors(validated.error)
        throw new BadRequestError400('The given data was invalid', errors)
    }

    next();
};