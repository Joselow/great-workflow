import { Request, Response, NextFunction } from "express";

import { BadRequestError400 } from "../../errors/BadRequestError400";
import { verifyUUID } from "../../validations/uuid";
import { formatValidationErrors } from "../../utils/formatValidationError";

export const uuidRequestForm = (req: Request, res: Response, next: NextFunction): void => {
    const { id } = req.params;

    const validated = verifyUUID(id)

    if (!validated.success) {
        const errors = formatValidationErrors(validated.error)
        throw new BadRequestError400('The given data was invalid', errors)
    }

    next();
};