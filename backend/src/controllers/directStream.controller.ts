import { Request, Response } from "express";
import { DirectStreamConfig } from "../models/DirectStreamConfig.model";
import { signBridgePairingToken } from "../utils/obsBridgeToken.util";
import { getSocketServer } from "../sockets";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

export const saveConfig = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const { teamId, platformLabel, rtmpUrl, streamKey } = req.body;

  const config = await DirectStreamConfig.findOneAndUpdate(
    { eventId },
    { teamId, platformLabel, rtmpUrl, streamKey },
    { upsert: true, new: true }
  );
  res.json({ success: true, data: { platformLabel: config.platformLabel, status: config.status } });
});

export const getStatus = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const config = await DirectStreamConfig.findOne({ eventId });
  res.json({ success: true, data: config ? { platformLabel: config.platformLabel, status: config.status } : null });
});

export const generatePairingToken = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const { teamId } = req.body;
  const token = signBridgePairingToken({ eventId, teamId });
  res.json({ success: true, data: { pairingToken: token, expiresInMinutes: 10 } });
});

export const startStream = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const config = await DirectStreamConfig.findOne({ eventId }).select("+streamKey");
  if (!config) throw ApiError.badRequest("Set up your platform's RTMP URL and stream key first");

  getSocketServer().of("/direct-stream-bridge").to(`direct-stream:${eventId}`).emit("directstream:start", {
    rtmpUrl: config.rtmpUrl,
    streamKey: config.streamKey,
  });
  res.json({ success: true, message: "Start command sent to the bridge" });
});

export const stopStream = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  getSocketServer().of("/direct-stream-bridge").to(`direct-stream:${eventId}`).emit("directstream:stop", {});
  res.json({ success: true, message: "Stop command sent to the bridge" });
});
