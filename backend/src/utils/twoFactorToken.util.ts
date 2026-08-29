import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface Pending2FAPayload {
  userId: string;
  purpose: "2fa-pending-login";
}

export function signPending2FAToken(userId: string): string {
  return jwt.sign({ userId, purpose: "2fa-pending-login" }, env.JWT_ACCESS_SECRET, {
    expiresIn: "5m",
  });
}

export function verifyPending2FAToken(token: string): Pending2FAPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as Pending2FAPayload;
  if (decoded.purpose !== "2fa-pending-login") throw new Error("Invalid token purpose");
  return decoded;
}
