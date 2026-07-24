import { env } from '../config/env.js';
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Logger Brain API is running',
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv
  });
});

export default router; 