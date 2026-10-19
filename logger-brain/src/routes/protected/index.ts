import { Router } from "express";

import { logRouter } from "./logRouter";
import { projectRouter } from "./projectRouter.js";
import { cardRouter } from "./cardRouter.js";
import { meetingRouter } from "./meetingRouter.js";
import { requirementRouter } from "./requirementRouter.js";
import { taskRouter } from "./taskRouter.js";
import { actionTemplateRouter } from "./actionTemplateRouter.js";

export const protectedRouter = Router();

protectedRouter.use("/log", logRouter);
protectedRouter.use("/project", projectRouter);
protectedRouter.use("/card", cardRouter);
protectedRouter.use("/meeting", meetingRouter);
protectedRouter.use("/requirement", requirementRouter);
protectedRouter.use("/task", taskRouter);
protectedRouter.use("/action-template", actionTemplateRouter);
