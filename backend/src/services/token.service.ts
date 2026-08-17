import { Response } from "express";
import { RefreshToken } from "../models/RefreshToken.model";
import {
  generateRefreshToken,
  msFromExpiresIn,
  signAccessToken,
} from "../utils/jwt.util";
import { env } from "../config/env";
import { Types } from "mongoose";

const REFRESH_COOKIE_NAME = "airmark_refresh";

export async function issueTokenPair(
  userId: Types.ObjectId,
  isSuperAdmin: boolean,
  res: Response,
  meta: { userAgent?: string; ipAddress?: string }
): Promise<{ accessToken: string }> {
  const accessToken = signAccessToken({
    userId: userId.toString(),
    isSuperAdmin,
  });

  const { token, tokenHash } = generateRefreshToken();
  const expiresAt = new Date(
    Date.now() + msFromExpiresIn(env.JWT_REFRESH_EXPIRES_IN)
  );

  await RefreshToken.create({
    userId,
    tokenHash,
    expiresAt,
    userAgent: meta.userAgent,
    ipAddress: meta.ipAddress,
  });

  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.IS_PRODUCTION,
    sameSite: env.IS_PRODUCTION ? "strict" : "lax",
    domain: env.IS_PRODUCTION ? env.COOKIE_DOMAIN : undefined,
    path: "/api/auth",
    maxAge: msFromExpiresIn(env.JWT_REFRESH_EXPIRES_IN),
  });

  return { accessToken };
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
}

export { REFRESH_COOKIE_NAME };
