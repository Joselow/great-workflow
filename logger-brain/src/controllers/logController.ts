import type { Request, Response } from "express";

import * as logService from "../services/logService";

import { getUserPayload } from "../helpers/authHelpers";

import { simpleSuccess } from "../utils/responses";


export const getLog = async (req: Request, res: Response) => {
  const user = getUserPayload(req)
  const projectId = typeof req.query.projectId === 'string' ? req.query.projectId : undefined
  const completedQuery = req.query.completed
  const completed = completedQuery === 'true' ? true : completedQuery === 'false' ? false : undefined
  const from = typeof req.query.from === 'string' ? req.query.from : undefined
  const to = typeof req.query.to === 'string' ? req.query.to : undefined

  const logsData = await logService.getLog(user.id, { projectId, completed, from, to })

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
