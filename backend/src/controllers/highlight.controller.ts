import { Request, Response } from "express";
import { Types } from "mongoose";
import { Event } from "../models/Event.model";
import { HighlightMarker } from "../models/HighlightMarker.model";
import { Membership } from "../models/Membership.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { emitToTeam } from "../sockets";
import { createNotification } from "../services/notification.service";
import { PERMISSIONS, WILDCARD_PERMISSION } from "../utils/permissions";

export const createMarker = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const { teamId, label } = req.body;
  const createdBy = new Types.ObjectId(req.user!.id);

  const event = await Event.findById(eventId);
  if (!event) throw ApiError.notFound("Event not found");

  const anchor = event.actualStartAt ?? event.createdAt;
  const offsetSeconds = Math.max(0, Math.round((Date.now() - anchor.getTime()) / 1000));

  const marker = await HighlightMarker.create({
    eventId,
    teamId,
    createdBy,
    label,
    offsetSeconds,
  });

  const populated = await marker.populate("createdBy", "firstName lastName");

  emitToTeam(teamId, "highlight:new", { eventId, marker: populated });

  res.status(201).json({ success: true, data: populated });
});

export const listMarkers = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const markers = await HighlightMarker.find({ eventId })
    .sort({ offsetSeconds: 1 })
    .populate("createdBy", "firstName lastName");

  res.json({ success: true, data: markers });
});

/**
 * Notifies Editors once an event ends — a batched summary rather than a
 * per-mark ping, since a director/operator marking 8 highlights during a
 * 2-hour service shouldn't fire 8 separate notifications.
 */
export const notifyEditorsOfHighlights = async (eventId: string, teamId: string, eventTitle: string) => {
  const count = await HighlightMarker.countDocuments({ eventId });
  if (count === 0) return;

  const memberships = await Membership.find({ teamId, status: "active" }).populate("roleId");
  const editors = memberships.filter((m) => {
    const role = m.roleId as any;
    return role?.permissions?.includes(WILDCARD_PERMISSION) || role?.permissions?.includes(PERMISSIONS.HIGHLIGHT_VIEW);
  });

  await Promise.all(
    editors.map((m) =>
      createNotification({
        userId: m.userId,
        teamId,
        eventId,
        type: "system",
        title: `${count} highlight${count === 1 ? "" : "s"} ready for review`,
        body: eventTitle,
      })
    )
  );
};
