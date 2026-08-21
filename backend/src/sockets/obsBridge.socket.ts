import { Server as SocketServer, Namespace, Socket } from "socket.io";
import { verifyBridgePairingToken } from "../utils/obsBridgeToken.util";
import { ObsConnection } from "../models/ObsConnection.model";
import { emitToTeam } from "./index";

interface PendingRequest {
  resolve: (result: { success: boolean; data?: unknown; error?: string }) => void;
  timeout: NodeJS.Timeout;
}

const pendingRequests = new Map<string, PendingRequest>();

/**
 * A dedicated namespace, separate from the main user-facing socket
 * connection: bridge scripts authenticate with a short-lived pairing
 * token, not a user JWT, since they represent a laptop process, not a
 * logged-in person.
 */
export function initializeObsBridgeNamespace(io: SocketServer): Namespace {
  const bridgeNs = io.of("/obs-bridge");

  bridgeNs.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) return next(new Error("Missing pairing token"));
      const payload = verifyBridgePairingToken(token);
      socket.data.eventId = payload.eventId;
      socket.data.teamId = payload.teamId;
      next();
    } catch {
      next(new Error("Invalid or expired pairing token"));
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

    socket.on("obs:hello", async (payload: { obsVersion: string; scenes: { sceneName: string; sceneIndex: number }[]; currentProgramScene: string }) => {
      await ObsConnection.findOneAndUpdate(
        { eventId },
        {
          obsVersion: payload.obsVersion,
          scenes: payload.scenes,
          currentProgramScene: payload.currentProgramScene,
          lastSeenAt: new Date(),
        }
      );
      emitToTeam(teamId, "obs:scenes-update", {
        eventId,
        scenes: payload.scenes,
        currentProgramScene: payload.currentProgramScene,
      });
    });

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

    socket.on("disconnect", async () => {
      await ObsConnection.findOneAndUpdate({ eventId }, { status: "disconnected" });
      emitToTeam(teamId, "obs:status", { eventId, status: "disconnected" });
      console.log(`[obs-bridge] disconnected: event=${eventId}`);
    });
  });

  return bridgeNs;
}

/**
 * Sends a command down to the bridge and awaits its result, with a
 * timeout — turns the fire-and-forget socket relay into something a
 * normal REST controller can await and respond to synchronously.
 */
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
