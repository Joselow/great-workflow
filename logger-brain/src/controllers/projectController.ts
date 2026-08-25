import type { Request, Response } from "express";

import * as projectService from "../services/projectService.js";
import { getUserPayload } from "../helpers/authHelpers.js";
import { simpleSuccess } from "../utils/responses.js";

import { NotFoundError404 } from "../errors/NotFoundError404.js";

export const getProjects = async (req: Request, res: Response) => {
    const user = getUserPayload(req);
    const projectsData = await projectService.getProjects(user.id);
    return simpleSuccess(res, 200, projectsData);
};

export const getProjectById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const project = await projectService.getProjectById(id);
    if (!project) {
        throw new NotFoundError404('Project not found');
    }
    return simpleSuccess(res, 200, project);
};

export const createProject = async (req: Request, res: Response) => {
    const { name, description, color } = req.body;
    const user = getUserPayload(req);

    const project = await projectService.createProject({
        userId: user.id,
        name,
        description,
        color,
    });

    return simpleSuccess(res, 201, project);
};

export const updateProject = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, color } = req.body;
    const user = getUserPayload(req);

    const project = await projectService.updateProject(id, user.id, {
        name,
        description,
        color,
    });

    return simpleSuccess(res, 200, project);
};
