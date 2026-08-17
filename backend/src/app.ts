import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import morgan from "morgan";
import { env } from "./config/env";
import routes from "./routes";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware";
import { globalRateLimiter } from "./middleware/rateLimiter.middleware";

export function createApp(): Application {
  const app = express();

  app.set("trust proxy", 1); // required behind Render's reverse proxy for correct req.ip

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    })
  );
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(cookieParser(env.COOKIE_SECRET));
  app.use(morgan(env.IS_PRODUCTION ? "combined" : "dev"));
  app.use(globalRateLimiter);

  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
