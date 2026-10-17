import type { NextFunction, Request, Response } from "express";

import {
    verifyCreateTaskSchema,
    verifyPatchTaskSchema,
    verifyTaskQuerySchema,
    verifyUpdateTaskSchema,
} from "../../validations/taskValidation.js";
import { formatValidationErrors } from "../../utils/formatValidationError.js";
import { BadRequestError400 } from "../../errors/BadRequestError400.js";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function rejectForbiddenLinks(payload: Record<string, unknown>) {
    const errors: Record<string, string[]> = {};

    if ("issueId" in payload) {
        errors.issueId = ["issueId is not allowed"];
    }

    if ("logId" in payload) {
        errors.logId = ["logId is not allowed"];
    }

    if (Object.keys(errors).length > 0) {
        throw new BadRequestError400("The given data was invalid", errors);
    }
}

function rejectMoveFields(payload: Record<string, unknown>) {
    const errors: Record<string, string[]> = {};

    if ("projectId" in payload) {
        errors.projectId = ["projectId cannot be changed"];
    }

    if ("meetingId" in payload) {
        errors.meetingId = ["meetingId cannot be changed"];
    }

    if (Object.keys(errors).length > 0) {
        throw new BadRequestError400("The given data was invalid", errors);
    }
}

export const storeTaskRequestForm = (req: Request, _res: Response, next: NextFunction): void => {
    if (!isRecord(req.body)) {
        throw new BadRequestError400("The given data was invalid");
    }

    rejectForbiddenLinks(req.body);

    const validated = verifyCreateTaskSchema(req.body);

    if (!validated.success) {
        const errors = formatValidationErrors(validated.error);
        throw new BadRequestError400("The given data was invalid", errors);
    }

    req.body = validated.data;
    next();
};

export const updateTaskRequestForm = (req: Request, _res: Response, next: NextFunction): void => {
    if (!isRecord(req.body)) {
        throw new BadRequestError400("The given data was invalid");
    }

    rejectForbiddenLinks(req.body);
    rejectMoveFields(req.body);

    const validated = verifyUpdateTaskSchema(req.body);

    if (!validated.success) {
        const errors = formatValidationErrors(validated.error);
        throw new BadRequestError400("The given data was invalid", errors);
    }

    req.body = validated.data;
    next();
};

export const patchTaskRequestForm = (req: Request, _res: Response, next: NextFunction): void => {
    if (!isRecord(req.body)) {
        throw new BadRequestError400("The given data was invalid");
    }

    const validated = verifyPatchTaskSchema(req.body);

    if (!validated.success) {
        const errors = formatValidationErrors(validated.error);
        throw new BadRequestError400("The given data was invalid", errors);
    }

    req.body = validated.data;
    next();
};

export const taskQueryRequestForm = (req: Request, _res: Response, next: NextFunction): void => {
    const { projectId, meetingId, requirementId, completed } = req.query;

    const validated = verifyTaskQuerySchema({
        projectId,
        meetingId,
        requirementId,
        completed,
    });

    if (!validated.success) {
        const errors = formatValidationErrors(validated.error);
        throw new BadRequestError400("The given data was invalid", errors);
    }

    next();
};
