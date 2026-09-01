import { Request, Response } from "express";
import { Notification } from "../models/Notification.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const filter = req.query.filter as string | undefined;
  const query: Record<string, unknown> = { userId: req.user!.id };
  if (filter === "unread") query.read = false;
  if (filter === "read") query.read = true;

  const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(100);
  const unreadCount = await Notification.countDocuments({ userId: req.user!.id, read: false });
  res.json({ success: true, data: { notifications, unreadCount } });
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const notificationId = req.params.notificationId as string;
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId: req.user!.id },
    { read: true },
    { new: true }
  );
  if (!notification) throw ApiError.notFound("Notification not found");
  res.json({ success: true, data: notification });
});

export const markAsUnread = asyncHandler(async (req: Request, res: Response) => {
  const notificationId = req.params.notificationId as string;
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId: req.user!.id },
    { read: false },
    { new: true }
  );
  if (!notification) throw ApiError.notFound("Notification not found");
  res.json({ success: true, data: notification });
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  await Notification.updateMany({ userId: req.user!.id, read: false }, { read: true });
  res.json({ success: true, message: "All notifications marked as read" });
});

export const getNotification = asyncHandler(async (req: Request, res: Response) => {
  const notificationId = req.params.notificationId as string;
  const notification = await Notification.findOne({ _id: notificationId, userId: req.user!.id });
  if (!notification) throw ApiError.notFound("Notification not found");

  if (!notification.read) {
    notification.read = true;
    await notification.save();
  }

  res.json({ success: true, data: notification });
});
