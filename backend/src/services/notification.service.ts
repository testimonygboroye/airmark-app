import { Types } from "mongoose";
import { Notification } from "../models/Notification.model";
import { getSocketServer } from "../sockets";
import type { NotificationType } from "../models/Notification.model";

interface CreateNotificationInput {
  userId: string | Types.ObjectId;
  teamId: string | Types.ObjectId;
  eventId?: string | Types.ObjectId;
  type: NotificationType;
  title: string;
  body?: string;
}

/**
 * Persists a notification and pushes it live over the user's personal
 * socket room if they're currently connected — the notification center
 * remains the source of truth either way, so nothing is lost if they're
 * offline or on a different screen when it happens.
 */
export async function createNotification(input: CreateNotificationInput): Promise<void> {
  const notification = await Notification.create(input);

  try {
    getSocketServer().to(`user:${input.userId}`).emit("notification:new", notification);
  } catch {
    /* socket server not yet initialized (e.g. during tests) — safe to skip */
  }
}
