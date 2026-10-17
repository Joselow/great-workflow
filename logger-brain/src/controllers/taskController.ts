import type { Request, Response } from "express";

import * as taskService from "../services/taskService.js";
import { getUserPayload } from "../helpers/authHelpers.js";
import { simpleSuccess } from "../utils/responses.js";

export const listTasks = async (req: Request, res: Response) => {
    const user = getUserPayload(req);
    const projectId = typeof req.query.projectId === "string" ? req.query.projectId : "";
    const meetingId = typeof req.query.meetingId === "string" ? req.query.meetingId : undefined;
    const completedQuery = req.query.completed;
    const completed = completedQuery === "true" ? true : completedQuery === "false" ? false : undefined;
    const requirementQuery = req.query.requirementId;
    const requirementId = requirementQuery === "null"
        ? null
        : typeof requirementQuery === "string"
            ? requirementQuery
            : undefined;

    const tasks = await taskService.listTasks(user.id, {
        projectId,
        meetingId,
        requirementId,
        completed,
    });

    return simpleSuccess(res, 200, tasks);
};

export const createTask = async (req: Request, res: Response) => {
    const user = getUserPayload(req);
    const { name, description, completed, projectId, meetingId, requirementId } = req.body;

    const task = await taskService.createTask(user.id, {
        name,
        description,
        completed,
        projectId,
        meetingId,
        requirementId,
    });

    return simpleSuccess(res, 201, task);
};

export const getTaskById = async (req: Request, res: Response) => {
    const user = getUserPayload(req);
    const { id } = req.params;

    const task = await taskService.getTaskByIdForUser(id, user.id);

    return simpleSuccess(res, 200, task);
};

export const updateTask = async (req: Request, res: Response) => {
    const user = getUserPayload(req);
    const { id } = req.params;
    const { name, description, completed, requirementId } = req.body;

    const task = await taskService.updateTask(id, user.id, {
        name,
        description,
        completed,
        requirementId,
    });

    return simpleSuccess(res, 200, task);
};

export const patchTask = async (req: Request, res: Response) => {
    const user = getUserPayload(req);
    const { id } = req.params;
    const { completed } = req.body;

    const task = await taskService.patchTaskCompleted(id, user.id, completed);

    return simpleSuccess(res, 200, task);
};

export const deleteTask = async (req: Request, res: Response) => {
    const user = getUserPayload(req);
    const { id } = req.params;

    await taskService.deleteTask(id, user.id);

    return simpleSuccess(res, 200, {
        message: "Task deleted successfully",
    });
};
