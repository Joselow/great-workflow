import { Router } from "express";

import healthRouter from "./health";
import { authRouter } from "./authRouter";
import { protectedRouter } from "./protected";
import { requireAuth } from "../middlewares/security/auth";

export const router = Router();


router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use('/app', requireAuth, protectedRouter)

router.use('/', (req, res) => {
    res.json({
        success: true,
        message: 'Logger Brain api',
        version: '1.0.0',
        endpoints: {
            api: '/api/v1/app',
        },
    });
})