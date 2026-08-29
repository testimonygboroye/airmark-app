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
    pingInterval: 10000,
    pingTimeout: 20000,
  });

  io.use(socketAuthMiddleware);

  io.on("connection", async (socket) => {
    const authedSocket = socket as AuthenticatedSocket;
    const { userId } = authedSocket.data;

    console.log(`[socket] connected: user=${userId} socket=${socket.id}`);

    socket.join(`user:${userId}`);

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
