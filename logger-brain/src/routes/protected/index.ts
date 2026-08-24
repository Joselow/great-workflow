import { Router } from "express";

import { logRouter } from "./logRouter";
import { projectRouter } from "./projectRouter.js";

export const protectedRouter = Router();

protectedRouter.use("/log", logRouter);
protectedRouter.use("/project", projectRouter);
