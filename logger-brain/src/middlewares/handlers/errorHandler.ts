import type { NextFunction, Request, Response } from "express";

import { env } from "../../config/env";
import { error } from "../../utils/responses";


export interface AppError extends Error {
  statusCode?: number,
  isOperational?: boolean,
  errors?: any,
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error en desarrollo
  console.log(env.nodeEnv);

  if (env.nodeEnv === 'development' || env.nodeEnv === 'test') {
    console.error('Error:', err);
  }

  let errorData: any = err.errors ?? err.message
  let errorStack: any = null
  let errorCause: any = null

  if (env.nodeEnv === 'development' || env.nodeEnv === 'test') {
    errorStack = err.stack ?? null
    errorCause = err.cause ?? null
  }
  
  error(res, statusCode, message, errorData, errorStack, errorCause);
};
