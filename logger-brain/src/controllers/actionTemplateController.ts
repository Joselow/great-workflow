import type { Request, Response } from 'express';

import { getUserPayload } from '../helpers/authHelpers.js';
import * as actionTemplateService from '../services/actionTemplateService.js';
import type { ActionTemplateModule } from '../services/actionTemplateService.js';
import { simpleSuccess } from '../utils/responses.js';

const isModule = (value: string): value is ActionTemplateModule =>
    value === 'all' || value === 'log' || value === 'meeting' || value === 'requirement' || value === 'task';

export const listActionTemplates = async (req: Request, res: Response) => {
    const user = getUserPayload(req);
    const moduleQuery = typeof req.query.module === 'string' ? req.query.module : undefined;
    const module = moduleQuery && isModule(moduleQuery) ? moduleQuery : undefined;

    const templates = await actionTemplateService.listActionTemplates(user.id, module);

    return simpleSuccess(res, 200, templates);
};

export const createActionTemplate = async (req: Request, res: Response) => {
    const user = getUserPayload(req);
    const template = await actionTemplateService.createActionTemplate(user.id, req.body);

    return simpleSuccess(res, 201, template);
};

export const getActionTemplateById = async (req: Request, res: Response) => {
    const user = getUserPayload(req);
    const template = await actionTemplateService.getActionTemplateByIdForUser(Number(req.params.id), user.id);

    return simpleSuccess(res, 200, template);
};

export const updateActionTemplate = async (req: Request, res: Response) => {
    const user = getUserPayload(req);
    const template = await actionTemplateService.updateActionTemplate(Number(req.params.id), user.id, req.body);

    return simpleSuccess(res, 200, template);
};

export const deleteActionTemplate = async (req: Request, res: Response) => {
    const user = getUserPayload(req);

    await actionTemplateService.deleteActionTemplate(Number(req.params.id), user.id);

    return simpleSuccess(res, 200, {
        message: 'Action template deleted successfully',
    });
};
