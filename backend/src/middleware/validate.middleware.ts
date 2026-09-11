import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { ApiError } from "../utils/ApiError";

export function validate(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse({ body: req.body, query: req.query, params: req.params });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        // Surface the actual specific problem (e.g. "RTMP URL must start
        // with rtmp:// or rtmps://") instead of a generic "Validation
        // failed" that hides what's actually wrong.
        const firstIssue = err.issues[0];
        const fieldPath = firstIssue.path.slice(1).join(".");
        const message = fieldPath ? `${fieldPath}: ${firstIssue.message}` : firstIssue.message;
        return next(ApiError.badRequest(message));
      }
      next(err);
    }
  };
}
