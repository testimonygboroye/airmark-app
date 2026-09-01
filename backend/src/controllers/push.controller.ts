import { Request, Response } from "express";
import { PushSubscription } from "../models/PushSubscription.model";
import { env } from "../config/env";
import { asyncHandler } from "../utils/asyncHandler";

export const subscribe = asyncHandler(async (req: Request, res: Response) => {
  const { endpoint, keys } = req.body;
  await PushSubscription.findOneAndUpdate(
    { endpoint },
    { userId: req.user!.id, endpoint, keys },
    { upsert: true }
  );
  res.status(201).json({ success: true });
});

export const unsubscribe = asyncHandler(async (req: Request, res: Response) => {
  const { endpoint } = req.body;
  await PushSubscription.deleteOne({ endpoint, userId: req.user!.id });
  res.json({ success: true });
});

export const getPublicKey = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: { publicKey: env.VAPID_PUBLIC_KEY } });
});
