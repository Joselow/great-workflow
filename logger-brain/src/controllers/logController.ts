import type { Request, Response } from "express";

import * as logService from "../services/logService";

import { getUserPayload } from "../helpers/authHelpers";
import { BadRequestError400 } from "../errors/BadRequestError400";

import { simpleSuccess } from "../utils/responses";
import { uuidSchema, verifyUUID } from "../validations/uuid";


export const getLog = async (req: Request, res: Response) => {
  const user = getUserPayload(req)

  const logsData = await logService.getLog(user.id)

  return simpleSuccess(res, 200, logsData)
}

export const createLog = async (req: Request, res: Response) => {
    const { meetingId, typeMeetingLink, description, responsible, tags, comment, completed } = req.body;

    const user = getUserPayload(req)

    const newLog = await logService.createLog({
      userId: user.id,
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

  const { meetingId, typeMeetingLink, description, responsible, tags, comment, completed } = req.body;

  const log = await logService.updateLog(id, {
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
