import type { Request, Response } from "express";

import * as logService from "../services/logService";

import { getUserPayload } from "../helpers/authHelpers";
import { BadRequestError400 } from "../errors/BadRequestError400";

import { simpleSuccess } from "../utils/responses";
import { verifyUUID } from "../validations/uuid";


export const getLog = async (req: Request, res: Response) => {
  const user = getUserPayload(req)
  const projectId = typeof req.query.projectId === 'string' ? req.query.projectId : undefined

  if (projectId) {
    const validated = verifyUUID(projectId)
    if (!validated.success) {
      throw new BadRequestError400('Invalid projectId')
    }
  }

  const logsData = await logService.getLog(user.id, projectId)

  return simpleSuccess(res, 200, logsData)
}

export const createLog = async (req: Request, res: Response) => {
    const { projectId, meetingId, typeMeetingLink, description, responsible, tags, comment, completed } = req.body;

    const user = getUserPayload(req)

    const newLog = await logService.createLog({
      userId: user.id,
      projectId,
      meetingId, 
      typeMeetingLink, 
      description, 
      responsible, 
      tags, 
      comment, 
      completed
    });

    return simpleSuccess(res, 201, newLog)
}

export const updateLog = async (req: Request, res: Response) => {
  const { id } = req.params;

    const { projectId, meetingId, typeMeetingLink, description, responsible, tags, comment, completed } = req.body;

    const log = await logService.updateLog(id, {
      projectId,
      meetingId,
    typeMeetingLink,
    description,
    responsible,
    tags,
    comment,
    completed
  });

  return simpleSuccess(res, 200, log)
}

export const destroyLog = async (req: Request, res: Response) => {
  const { id } = req.params

  logService.destroyLog(id)

  return simpleSuccess(res, 200, {
    message: 'Log successfully deleted',
  });
}
