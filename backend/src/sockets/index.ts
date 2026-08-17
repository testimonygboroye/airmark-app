import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { env } from "../config/env";
import { socketAuthMiddleware, AuthenticatedSocket } from "./auth.socket";
import { Membership } from "../models/Membership.model";

let io: SocketServer | null = null;

export function initializeSocketServer(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
    // Aggressive but reasonable reconnect-friendly timings — a phone losing
    // signal briefly during a live event must not be treated as a full
    // disconnect prematurely.
    pingInterval: 10000,
    pingTimeout: 20000,
  });

  io.use(socketAuthMiddleware);

  io.on("connection", async (socket) => {
    const authedSocket = socket as AuthenticatedSocket;
    const { userId } = authedSocket.data;

    console.log(`[socket] connected: user=${userId} socket=${socket.id}`);

    // Auto-join every team room this user is an active member of, so
    // reconnects immediately resync into the right broadcast channels
    // without any extra client-side handshake step.
    try {
      const memberships = await Membership.find({
        userId,
        status: "active",
      }).select("teamId");

      memberships.forEach((m) => {
        socket.join(`team:${m.teamId.toString()}`);
      });

      socket.emit("connection:ready", {
        teams: memberships.map((m) => m.teamId.toString()),
      });
    } catch (err) {
      console.error("[socket] failed to join team rooms:", err);
    }

    socket.on("disconnect", (reason) => {
      console.log(`[socket] disconnected: user=${userId} reason=${reason}`);
    });
  });

  return io;
}

/**
 * Feature modules call this to emit into a specific team's room without
 * needing direct access to the raw Socket.IO instance.
 */
export function emitToTeam(teamId: string, event: string, payload: unknown): void {
  if (!io) {
    console.warn("[socket] emitToTeam called before initialization");
    return;
  }
  io.to(`team:${teamId}`).emit(event, payload);
}

export function getSocketServer(): SocketServer {
  if (!io) {
    throw new Error("Socket server not initialized");
  }
  return io;
}
