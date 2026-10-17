import type { Request, Response } from "express";

import * as requirementService from "../services/requirementService.js";
import { getUserPayload } from "../helpers/authHelpers.js";
import { simpleSuccess } from "../utils/responses.js";

export const listRequirements = async (req: Request, res: Response) => {
    const user = getUserPayload(req);
    const projectId = typeof req.query.projectId === "string" ? req.query.projectId : "";
    const meetingId = typeof req.query.meetingId === "string" ? req.query.meetingId : undefined;

    const requirements = await requirementService.listRequirements(user.id, {
        projectId,
        meetingId,
    });

    return simpleSuccess(res, 200, requirements);
};

export const createRequirement = async (req: Request, res: Response) => {
    const user = getUserPayload(req);
    const { name, projectId, meetingId } = req.body;

    const requirement = await requirementService.createRequirement(user.id, {
        name,
        projectId,
        meetingId,
    });

    return simpleSuccess(res, 201, requirement);
};

export const getRequirementById = async (req: Request, res: Response) => {
    const user = getUserPayload(req);
    const { id } = req.params;

    const requirement = await requirementService.getRequirementByIdForUser(id, user.id);

    return simpleSuccess(res, 200, requirement);
};

export const updateRequirement = async (req: Request, res: Response) => {
    const user = getUserPayload(req);
    const { id } = req.params;
    const { name } = req.body;

    const requirement = await requirementService.updateRequirement(id, user.id, name);

    return simpleSuccess(res, 200, requirement);
};

export const deleteRequirement = async (req: Request, res: Response) => {
    const user = getUserPayload(req);
    const { id } = req.params;

    await requirementService.deleteRequirement(id, user.id);

    return simpleSuccess(res, 200, {
        message: "Requirement deleted successfully",
    });
};
