import { Request, Response } from "express";
import { ObsConnection } from "../models/ObsConnection.model";
import { signBridgePairingToken } from "../utils/obsBridgeToken.util";
import { sendObsCommand } from "../sockets/obsBridge.socket";
import { getSocketServer } from "../sockets";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";

export const generatePairingToken = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const { teamId } = req.body;

  const token = signBridgePairingToken({ eventId, teamId });

  res.json({
    success: true,
    data: {
      pairingToken: token,
      bridgeSocketUrl: env.CLIENT_URL.includes("localhost")
        ? "http://localhost:5000"
        : req.protocol + "://" + req.get("host"),
      expiresInMinutes: 10,
    },
  });
});

export const getObsStatus = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const connection = await ObsConnection.findOne({ eventId });

  res.json({
    success: true,
    data: connection ?? { status: "disconnected", scenes: [] },
  });
});

export const setScene = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const { sceneName } = req.body;

  const connection = await ObsConnection.findOne({ eventId });
  if (!connection || connection.status !== "connected") {
    throw ApiError.badRequest("OBS is not connected for this event");
  }

  const result = await sendObsCommand(getSocketServer(), eventId, "SetCurrentProgramScene", {
    sceneName,
  });

  if (!result.success) {
    throw ApiError.badRequest(result.error || "Failed to switch scene");
  }

  res.json({ success: true, data: { sceneName } });
});
