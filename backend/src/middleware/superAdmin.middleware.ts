import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export function requireSuperAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user?.isSuperAdmin) {
    return next(ApiError.forbidden("Founder/Super Admin access required"));
  }
  next();
}
