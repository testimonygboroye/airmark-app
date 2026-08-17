import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.util";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/User.model";

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Missing access token");
    }
    const token = header.slice(7);
    const payload = verifyAccessToken(token);

    const user = await User.findById(payload.userId);
    if (!user) {
      throw ApiError.unauthorized("Account no longer exists");
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
    };
    next();
  } catch (err) {
    next(ApiError.unauthorized("Invalid or expired access token"));
  }
};
