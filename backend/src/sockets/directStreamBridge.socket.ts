import { Server as SocketServer } from "socket.io";
import { verifyBridgePairingToken } from "../utils/obsBridgeToken.util";
import { DirectStreamConfig } from "../models/DirectStreamConfig.model";
import { emitToTeam } from "./index";

export function initializeDirectStreamBridgeNamespace(io: SocketServer): void {
  const ns = io.of("/direct-stream-bridge");

  ns.use((socket, next) => {
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

  ns.on("connection", async (socket) => {
    const { eventId, teamId } = socket.data as { eventId: string; teamId: string };
    socket.join(`direct-stream:${eventId}`);

    await DirectStreamConfig.findOneAndUpdate({ eventId }, { status: "connected" });
    emitToTeam(teamId, "directstream:status", { eventId, status: "connected" });

    socket.on("directstream:streaming", async () => {
      await DirectStreamConfig.findOneAndUpdate({ eventId }, { status: "streaming" });
      emitToTeam(teamId, "directstream:status", { eventId, status: "streaming" });
    });

    socket.on("directstream:stopped", async () => {
      await DirectStreamConfig.findOneAndUpdate({ eventId }, { status: "connected" });
      emitToTeam(teamId, "directstream:status", { eventId, status: "connected" });
    });

    socket.on("directstream:error", (payload: { message: string }) => {
      emitToTeam(teamId, "directstream:error", { eventId, message: payload.message });
    });

    socket.on("disconnect", async () => {
      await DirectStreamConfig.findOneAndUpdate({ eventId }, { status: "idle" });
      emitToTeam(teamId, "directstream:status", { eventId, status: "idle" });
    });
  });
}
