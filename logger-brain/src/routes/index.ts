import { Router } from "express";

import healthRouter from "./health";
import { authRouter } from "./authRouter";
import { protectedRouter } from "./protected";

import { requireAuth } from "../middlewares/security/auth";

export const router = Router();

router.get("/health", healthRouter);
router.use("/auth", authRouter);

router.use('/', [requireAuth], protectedRouter)
