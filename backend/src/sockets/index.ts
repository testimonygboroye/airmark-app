import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { env } from "../config/env";
import { socketAuthMiddleware, AuthenticatedSocket } from "./auth.socket";
import { Membership } from "../models/Membership.model";

let io: SocketServer | null = null;

export function initializeSocketServer(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
    pingInterval: 10000,
    pingTimeout: 20000,
  });

  io.use(socketAuthMiddleware);

  io.on("connection", async (socket) => {
    const authedSocket = socket as AuthenticatedSocket;
    const { userId, isPublic, publicTeamId } = authedSocket.data;

    socket.join(`user:${userId}`);

    if (isPublic && publicTeamId) {
      // Public viewers only ever join the single team room tied to the
      // share link they used — never their own personal notifications
      // room's content, never any other team.
      socket.join(`team:${publicTeamId}`);
      socket.emit("connection:ready", { teams: [publicTeamId] });
    } else {
      try {
        const memberships = await Membership.find({ userId, status: "active" }).select("teamId");
        memberships.forEach((m) => socket.join(`team:${m.teamId.toString()}`));
        socket.emit("connection:ready", { teams: memberships.map((m) => m.teamId.toString()) });
      } catch (err) {
        console.error("[socket] failed to join team rooms:", err);
      }
    }

    socket.on("webrtc:offer", (payload: { toUserId: string }) => {
      io!.to(`user:${payload.toUserId}`).emit("webrtc:offer", { ...payload, fromUserId: userId });
    });
    socket.on("webrtc:answer", (payload: { toUserId: string }) => {
      io!.to(`user:${payload.toUserId}`).emit("webrtc:answer", { ...payload, fromUserId: userId });
    });
    socket.on("webrtc:ice-candidate", (payload: { toUserId: string }) => {
      io!.to(`user:${payload.toUserId}`).emit("webrtc:ice-candidate", { ...payload, fromUserId: userId });
    });
    socket.on("webrtc:camera-ready", (payload: { teamId: string }) => {
      io!.to(`team:${payload.teamId}`).emit("webrtc:camera-ready", { ...payload, operatorUserId: userId });
    });
    socket.on("webrtc:camera-stopped", (payload: { teamId: string }) => {
      io!.to(`team:${payload.teamId}`).emit("webrtc:camera-stopped", { ...payload, operatorUserId: userId });
    });
    socket.on("webrtc:request-cameras", (payload: { teamId: string }) => {
      io!.to(`team:${payload.teamId}`).emit("webrtc:request-cameras", payload);
    });

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
  if (!io) throw new Error("Socket server not initialized");
  return io;
}
