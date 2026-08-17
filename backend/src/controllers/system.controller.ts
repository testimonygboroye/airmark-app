import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { pingBrevoAccount } from "../services/email.service";

export const healthCheck = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, status: "ok", timestamp: new Date().toISOString() });
});

/**
 * Hit daily by an external cron-job.org scheduled job. Serves two purposes:
 * 1. Wakes/keeps the Render free-tier backend warm.
 * 2. Makes a genuine Brevo API call so the API key never crosses Brevo's
 *    90-consecutive-day inactivity expiry window.
 */
export const keepAlive = asyncHandler(async (_req: Request, res: Response) => {
  const brevoStatus = await pingBrevoAccount();
  res.json({
    success: true,
    message: "Keep-alive ping successful",
    brevoAccount: brevoStatus.email,
    timestamp: new Date().toISOString(),
  });
});
