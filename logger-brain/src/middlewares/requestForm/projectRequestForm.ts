import type { NextFunction, Request, Response } from "express";

import { verifyCreateProjectSchema, verifyUpdateProjectSchema } from "../../validations/projectValidation.js";
import { formatValidationErrors } from "../../utils/formatValidationError.js";
import { BadRequestError400 } from "../../errors/BadRequestError400.js";

export const storeProjectRequestForm = (req: Request, _res: Response, next: NextFunction): void => {
    const { id } = req.params;
    const { name, description, color } = req.body;

    const payload = { name, description, color };

    const validated = id
        ? verifyUpdateProjectSchema(payload)
        : verifyCreateProjectSchema(payload);

    if (!validated.success) {
        const errors = formatValidationErrors(validated.error);
        throw new BadRequestError400('The given data was invalid', errors);
    }

    next();
};
