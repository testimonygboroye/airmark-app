import { Server as SocketServer, Namespace, Socket } from "socket.io";
import { verifyBridgePairingToken } from "../utils/obsBridgeToken.util";
import { ObsConnection } from "../models/ObsConnection.model";
import { emitToTeam } from "./index";

interface PendingRequest {
  resolve: (result: { success: boolean; data?: unknown; error?: string }) => void;
  timeout: NodeJS.Timeout;
}

const pendingRequests = new Map<string, PendingRequest>();

export function initializeObsBridgeNamespace(io: SocketServer): Namespace {
  const bridgeNs = io.of("/obs-bridge");

  bridgeNs.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) return next(new Error("Missing pairing token"));
      const payload = verifyBridgePairingToken(token, "obs-bridge-pairing");
      socket.data.eventId = payload.eventId;
      socket.data.teamId = payload.teamId;
      next();
    } catch (err) {
      next(new Error((err as Error).message || "Invalid or expired pairing token"));
    }
  });

  bridgeNs.on("connection", async (socket: Socket) => {
    const { eventId, teamId } = socket.data as { eventId: string; teamId: string };
    socket.join(`obs-bridge:${eventId}`);

    await ObsConnection.findOneAndUpdate(
      { eventId },
      { teamId, status: "connected", connectedAt: new Date(), lastSeenAt: new Date() },
      { upsert: true }
    );

    emitToTeam(teamId, "obs:status", { eventId, status: "connected" });
    console.log(`[obs-bridge] connected: event=${eventId}`);

    socket.on(
      "obs:hello",
      async (payload: {
        obsVersion: string;
        scenes: { sceneName: string; sceneIndex: number }[];
        currentProgramScene: string;
        transitions: string[];
        currentTransition: string;
        transitionDurationMs: number;
        sceneItems: { sceneItemId: number; sourceName: string; sceneItemEnabled: boolean }[];
      }) => {
        await ObsConnection.findOneAndUpdate(
          { eventId },
          {
            obsVersion: payload.obsVersion,
            scenes: payload.scenes,
            currentProgramScene: payload.currentProgramScene,
            transitions: payload.transitions,
            currentTransition: payload.currentTransition,
            transitionDurationMs: payload.transitionDurationMs,
            sceneItems: payload.sceneItems,
            lastSeenAt: new Date(),
          }
        );
        emitToTeam(teamId, "obs:full-update", { eventId, ...payload });
      }
    );

    socket.on(
      "obs:command:result",
      (payload: { requestId: string; success: boolean; data?: unknown; error?: string }) => {
        const pending = pendingRequests.get(payload.requestId);
        if (!pending) return;
        clearTimeout(pending.timeout);
        pending.resolve({ success: payload.success, data: payload.data, error: payload.error });
        pendingRequests.delete(payload.requestId);
      }
    );

    socket.on("obs:scene-changed", async (payload: { currentProgramScene: string }) => {
      await ObsConnection.findOneAndUpdate({ eventId }, { currentProgramScene: payload.currentProgramScene, lastSeenAt: new Date() });
      emitToTeam(teamId, "obs:scene-changed", { eventId, currentProgramScene: payload.currentProgramScene });
    });

    socket.on(
      "obs:scene-items-update",
      async (payload: { sceneName: string; items: { sceneItemId: number; sourceName: string; sceneItemEnabled: boolean }[] }) => {
        await ObsConnection.findOneAndUpdate({ eventId }, { sceneItems: payload.items });
        emitToTeam(teamId, "obs:scene-items-update", { eventId, ...payload });
      }
    );

    socket.on("obs:scene-item-toggled", async (payload: { sceneItemId: number; sceneItemEnabled: boolean }) => {
      const connection = await ObsConnection.findOne({ eventId });
      if (connection) {
        connection.sceneItems = connection.sceneItems.map((item) =>
          item.sceneItemId === payload.sceneItemId
            ? { ...item, sceneItemEnabled: payload.sceneItemEnabled }
            : item
        );
        await connection.save();
      }
      emitToTeam(teamId, "obs:scene-item-toggled", { eventId, ...payload });
    });

    socket.on("obs:transition-changed", async (payload: { transitionName: string }) => {
      await ObsConnection.findOneAndUpdate({ eventId }, { currentTransition: payload.transitionName });
      emitToTeam(teamId, "obs:transition-changed", { eventId, ...payload });
    });

    socket.on(
      "obs:health-update",
      async (payload: {
        streaming: { active: boolean; outputSkippedFrames: number; outputTotalFrames: number };
        recording: { active: boolean };
      }) => {
        await ObsConnection.findOneAndUpdate(
          { eventId },
          { streamStatus: payload.streaming, recordStatus: payload.recording, lastSeenAt: new Date() }
        );
        emitToTeam(teamId, "obs:health-update", { eventId, ...payload });
      }
    );

    socket.on("disconnect", async () => {
      await ObsConnection.findOneAndUpdate({ eventId }, { status: "disconnected" });
      emitToTeam(teamId, "obs:status", { eventId, status: "disconnected" });
      console.log(`[obs-bridge] disconnected: event=${eventId}`);
    });
  });

  return bridgeNs;
}

export function sendObsCommand(
  io: SocketServer,
  eventId: string,
  requestType: string,
  requestData: Record<string, unknown> = {},
  timeoutMs = 8000
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  return new Promise((resolve) => {
    const requestId = `${eventId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const timeout = setTimeout(() => {
      pendingRequests.delete(requestId);
      resolve({ success: false, error: "OBS bridge did not respond in time" });
    }, timeoutMs);

    pendingRequests.set(requestId, { resolve, timeout });

    io.of("/obs-bridge")
      .to(`obs-bridge:${eventId}`)
      .emit("obs:command", { requestId, requestType, requestData });
  });
}

/** Fire-and-forget — no response expected, used for the bridge's local countdown overlay renderer. */
export function sendObsInstruction(
  io: SocketServer,
  eventId: string,
  event: string,
  payload: Record<string, unknown>
): void {
  io.of("/obs-bridge").to(`obs-bridge:${eventId}`).emit(event, payload);
}
