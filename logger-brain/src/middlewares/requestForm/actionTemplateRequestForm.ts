import type { NextFunction, Request, Response } from 'express';

import { BadRequestError400 } from '../../errors/BadRequestError400.js';
import { formatValidationErrors } from '../../utils/formatValidationError.js';
import {
    verifyActionTemplateId,
    verifyActionTemplateQuerySchema,
    verifyActionTemplateWriteSchema,
} from '../../validations/actionTemplateValidation.js';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export const actionTemplateIdRequestForm = (req: Request, _res: Response, next: NextFunction): void => {
    const id = req.params.id;

    if (typeof id !== 'string' || !verifyActionTemplateId(id).success) {
        throw new BadRequestError400('The given data was invalid', {
            id: ['id must be a positive integer'],
        });
    }

    next();
};

export const storeActionTemplateRequestForm = (req: Request, _res: Response, next: NextFunction): void => {
    if (!isRecord(req.body)) {
        throw new BadRequestError400('The given data was invalid');
    }

    const validated = verifyActionTemplateWriteSchema(req.body);

    if (!validated.success) {
        const errors = formatValidationErrors(validated.error);
        throw new BadRequestError400('The given data was invalid', errors);
    }

    req.body = validated.data;
    next();
};

export const actionTemplateQueryRequestForm = (req: Request, _res: Response, next: NextFunction): void => {
    const validated = verifyActionTemplateQuerySchema({
        module: req.query.module,
    });

    if (!validated.success) {
        const errors = formatValidationErrors(validated.error);
        throw new BadRequestError400('The given data was invalid', errors);
    }

    next();
};
