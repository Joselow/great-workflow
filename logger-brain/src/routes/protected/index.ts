import { Router } from "express";
import { logRouter } from "./logRouter";

export const protectedRouter = Router();

protectedRouter.use("/log", logRouter);