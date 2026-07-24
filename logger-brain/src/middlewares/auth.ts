import type { NextFunction, Request, Response } from "express";

import { verifyAccessToken } from "../utils/jwt";
import { InvalidCredentialsError401 } from "../errors/InvalidCredentialsError401";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const bearerToken = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  const token = bearerToken ?? req.cookies?.token;

  if (!token) {
    throw new InvalidCredentialsError401("Access token required")
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload
    next();
  } catch {
    next(new InvalidCredentialsError401("Invalid or expired token"));
  }
}
