import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import express from "express";

import { env, isProduction } from "./config/env";

import { router } from "./routes";

import { errorHandler } from "./middlewares/handlers/errorHandler";
import { notFound } from "./middlewares/handlers/notFound";
import { globalLimiter } from "./middlewares/security/rateLimiter";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(morgan(isProduction ? "combined" : "dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(globalLimiter);

  app.use("/api/v1", router);
  
  app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Logger Brain apis',
        endpoints: {
            apis: ['/api/v1'],
        },
    });
});
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
