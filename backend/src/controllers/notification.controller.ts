import { Request, Response } from "express";
import { Notification } from "../models/Notification.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const notifications = await Notification.find({ userId: req.user!.id })
    .sort({ createdAt: -1 })
    .limit(50);
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

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  await Notification.updateMany({ userId: req.user!.id, read: false }, { read: true });
  res.json({ success: true, message: "All notifications marked as read" });
});
