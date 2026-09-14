import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env";
import { Event } from "../models/Event.model";

export interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    isPublic?: boolean;
    publicTeamId?: string;
  };
}

export async function socketAuthMiddleware(socket: Socket, next: (err?: Error) => void): Promise<void> {
  const token = socket.handshake.auth?.token as string | undefined;
  const publicShareToken = socket.handshake.auth?.publicShareToken as string | undefined;

  if (token) {
    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { userId: string };
      socket.data.userId = decoded.userId;
      next();
      return;
    } catch {
      next(new Error("Invalid or expired token"));
      return;
    }
  }

  if (publicShareToken) {
    // No login required — the unguessable share token itself is the
    // credential. This socket only ever joins the one event's team
    // room, never a real user's personal notifications or other teams.
    const event = await Event.findOne({ publicShareToken });
    if (!event) {
      next(new Error("Invalid public share link"));
      return;
    }
    socket.data.userId = `public-${crypto.randomBytes(8).toString("hex")}`;
    socket.data.isPublic = true;
    socket.data.publicTeamId = event.teamId.toString();
    next();
    return;
  }

  next(new Error("Missing authentication"));
}
