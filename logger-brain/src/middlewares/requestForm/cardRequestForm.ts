import type { NextFunction, Request, Response } from "express";

import { verifyCardListQuerySchema, verifyCreateCardSchema, verifyUpdateCardSchema } from "../../validations/cardValidation.js";
import { formatValidationErrors } from "../../utils/formatValidationError.js";
import { BadRequestError400 } from "../../errors/BadRequestError400.js";

export const storeCardRequestForm = (req: Request, _res: Response, next: NextFunction): void => {
    const { id } = req.params;
    const { name, description, color, isPrompt, flMeeting, projectId, sections } = req.body;

    const payload = { name, description, color, isPrompt, flMeeting, projectId, sections };

    const validated = id
        ? verifyUpdateCardSchema(payload)
        : verifyCreateCardSchema(payload);

    if (!validated.success) {
        const errors = formatValidationErrors(validated.error);
        throw new BadRequestError400('The given data was invalid', errors);
    }

    next();
};

export const cardListQueryRequestForm = (req: Request, _res: Response, next: NextFunction): void => {
    const { q, projectId, isPrompt, flMeeting, page, limit } = req.query;

    const validated = verifyCardListQuerySchema({
        q,
        projectId,
        isPrompt,
        flMeeting,
        page,
        limit,
    });

    if (!validated.success) {
        const errors = formatValidationErrors(validated.error);
        throw new BadRequestError400('The given data was invalid', errors);
    }

    next();
};
