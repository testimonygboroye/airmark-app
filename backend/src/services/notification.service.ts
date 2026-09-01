import { Types } from "mongoose";
import { Notification } from "../models/Notification.model";
import { getSocketServer } from "../sockets";
import { sendPushToUser } from "./push.service";
import type { NotificationType } from "../models/Notification.model";

interface CreateNotificationInput {
  userId: string | Types.ObjectId;
  teamId: string | Types.ObjectId;
  eventId?: string | Types.ObjectId;
  type: NotificationType;
  title: string;
  body?: string;
}

export async function createNotification(input: CreateNotificationInput): Promise<void> {
  const notification = await Notification.create(input);

  try {
    getSocketServer().to(`user:${input.userId}`).emit("notification:new", notification);
  } catch {
    /* socket server not yet initialized (e.g. during tests) — safe to skip */
  }

  // Best-effort — a failed push (e.g. no subscription yet) must never
  // block the in-app notification, which is already reliably delivered.
  sendPushToUser(input.userId.toString(), { title: input.title, body: input.body }).catch(() => {});
}
