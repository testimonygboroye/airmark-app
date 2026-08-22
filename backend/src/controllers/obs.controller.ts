import { Request, Response } from "express";
import { ObsConnection } from "../models/ObsConnection.model";
import { Event } from "../models/Event.model";
import { signBridgePairingToken } from "../utils/obsBridgeToken.util";
import { sendObsCommand, sendObsInstruction } from "../sockets/obsBridge.socket";
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
  const result = await sendObsCommand(getSocketServer(), eventId, "SetCurrentProgramScene", { sceneName });
  if (!result.success) throw ApiError.badRequest(result.error || "Failed to switch scene");
  res.json({ success: true, data: { sceneName } });
});

export const setTransition = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const { transitionName, transitionDurationMs } = req.body;
  await requireConnectedBridge(eventId);
  const result = await sendObsCommand(getSocketServer(), eventId, "SetCurrentSceneTransition", { transitionName });
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

export const setFallbackScene = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const { sceneName } = req.body;
  const connection = await ObsConnection.findOneAndUpdate({ eventId }, { fallbackSceneName: sceneName }, { new: true });
  if (!connection) throw ApiError.notFound("OBS connection not found for this event");
  res.json({ success: true, data: { fallbackSceneName: sceneName } });
});

export const triggerFallback = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const connection = await requireConnectedBridge(eventId);
  if (!connection.fallbackSceneName) throw ApiError.badRequest("No fallback scene has been set for this event yet");
  const result = await sendObsCommand(getSocketServer(), eventId, "SetCurrentProgramScene", {
    sceneName: connection.fallbackSceneName,
  });
  if (!result.success) throw ApiError.badRequest(result.error || "Failed to switch to fallback scene");
  res.json({ success: true, data: { sceneName: connection.fallbackSceneName } });
});

export const startStream = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  await requireConnectedBridge(eventId);
  const result = await sendObsCommand(getSocketServer(), eventId, "StartStream");
  if (!result.success) throw ApiError.badRequest(result.error || "Failed to start stream");
  res.json({ success: true });
});

export const stopStream = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  await requireConnectedBridge(eventId);
  const result = await sendObsCommand(getSocketServer(), eventId, "StopStream");
  if (!result.success) throw ApiError.badRequest(result.error || "Failed to stop stream");
  res.json({ success: true });
});

export const startRecord = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  await requireConnectedBridge(eventId);
  const result = await sendObsCommand(getSocketServer(), eventId, "StartRecord");
  if (!result.success) throw ApiError.badRequest(result.error || "Failed to start recording");
  res.json({ success: true });
});

export const stopRecord = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  await requireConnectedBridge(eventId);
  const result = await sendObsCommand(getSocketServer(), eventId, "StopRecord");
  if (!result.success) throw ApiError.badRequest(result.error || "Failed to stop recording");
  res.json({ success: true });
});

export const setWatermarkSource = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const { sceneItemId } = req.body;
  const connection = await ObsConnection.findOneAndUpdate({ eventId }, { watermarkSceneItemId: sceneItemId }, { new: true });
  if (!connection) throw ApiError.notFound("OBS connection not found for this event");
  res.json({ success: true, data: { watermarkSceneItemId: sceneItemId } });
});

export const toggleWatermark = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const { enabled } = req.body;
  const connection = await requireConnectedBridge(eventId);
  if (typeof connection.watermarkSceneItemId !== "number") {
    throw ApiError.badRequest("No watermark source has been set for this event yet");
  }
  const result = await sendObsCommand(getSocketServer(), eventId, "SetSceneItemEnabled", {
    sceneName: connection.currentProgramScene,
    sceneItemId: connection.watermarkSceneItemId,
    sceneItemEnabled: enabled,
  });
  if (!result.success) throw ApiError.badRequest(result.error || "Failed to toggle watermark");
  res.json({ success: true, data: { enabled } });
});

export const startCountdownOverlay = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const { sourceName } = req.body;

  await requireConnectedBridge(eventId);

  const event = await Event.findById(eventId);
  if (!event?.countdownTargetAt || event.countdownTargetAt.getTime() < Date.now()) {
    throw ApiError.badRequest("No active countdown to push to OBS");
  }

  sendObsInstruction(getSocketServer(), eventId, "obs:countdown-overlay:start", {
    sourceName,
    targetAt: event.countdownTargetAt.toISOString(),
  });

  res.json({ success: true, data: { sourceName, targetAt: event.countdownTargetAt } });
});

export const stopCountdownOverlay = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  await requireConnectedBridge(eventId);
  sendObsInstruction(getSocketServer(), eventId, "obs:countdown-overlay:stop", {});
  res.json({ success: true });
});
