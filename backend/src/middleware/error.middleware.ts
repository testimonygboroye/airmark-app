import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;
  const message = isApiError ? err.message : "Internal server error";

  if (!isApiError) {
    console.error("[unhandled error]", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(isApiError && err.details ? { details: err.details } : {}),
    ...(env.NODE_ENV === "development" && !isApiError
      ? { stack: err.stack }
      : {}),
  });
}
