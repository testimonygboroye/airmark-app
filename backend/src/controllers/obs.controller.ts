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
    data: connection ?? { status: "disconnected", scenes: [], transitions: [], sceneItems: [] },
  });
});

async function requireConnectedBridge(eventId: string) {
  const connection = await ObsConnection.findOne({ eventId });
  if (!connection || connection.status !== "connected") {
    throw ApiError.badRequest("OBS is not connected for this event");
  }
  return connection;
}

export const setScene = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const { sceneName } = req.body;

  await requireConnectedBridge(eventId);

  const result = await sendObsCommand(getSocketServer(), eventId, "SetCurrentProgramScene", {
    sceneName,
  });

  if (!result.success) throw ApiError.badRequest(result.error || "Failed to switch scene");
  res.json({ success: true, data: { sceneName } });
});

export const setTransition = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const { transitionName, transitionDurationMs } = req.body;

  await requireConnectedBridge(eventId);

  const result = await sendObsCommand(getSocketServer(), eventId, "SetCurrentSceneTransition", {
    transitionName,
  });
  if (!result.success) throw ApiError.badRequest(result.error || "Failed to set transition");

  if (typeof transitionDurationMs === "number") {
    await sendObsCommand(getSocketServer(), eventId, "SetCurrentSceneTransitionDuration", {
      transitionDuration: transitionDurationMs,
    });
  }

  res.json({ success: true, data: { transitionName, transitionDurationMs } });
});

export const toggleSceneItem = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const sceneItemId = parseInt(req.params.sceneItemId as string, 10);
  const { enabled } = req.body;

  const connection = await requireConnectedBridge(eventId);

  const result = await sendObsCommand(getSocketServer(), eventId, "SetSceneItemEnabled", {
    sceneName: connection.currentProgramScene,
    sceneItemId,
    sceneItemEnabled: enabled,
  });

  if (!result.success) throw ApiError.badRequest(result.error || "Failed to toggle source");
  res.json({ success: true, data: { sceneItemId, enabled } });
});

/**
 * Updates the live text content of a GDI+/FreeType2 text source in OBS —
 * covers lower-thirds (name/title captions) and the flexible text/quote/
 * verse overlay module in one primitive, since both are just OBS text
 * sources with different naming conventions set up by the team.
 */
export const setTextSource = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const { sourceName, text } = req.body;

  await requireConnectedBridge(eventId);

  const result = await sendObsCommand(getSocketServer(), eventId, "SetInputSettings", {
    inputName: sourceName,
    inputSettings: { text },
  });

  if (!result.success) throw ApiError.badRequest(result.error || "Failed to update text overlay");
  res.json({ success: true, data: { sourceName, text } });
});
