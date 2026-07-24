import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import express from "express";

import { env, isProduction } from "./config/env";

import { router } from "./routes";

import { errorHandler } from "./middlewares/handlers/errorHandler";
import { notFound } from "./middlewares/handlers/nodFound";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(morgan(isProduction ? "combined" : "dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 100,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.use("/api", router);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
