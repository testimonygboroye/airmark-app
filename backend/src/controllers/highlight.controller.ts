import { Request, Response } from "express";
import { Types } from "mongoose";
import { Event } from "../models/Event.model";
import { HighlightMarker } from "../models/HighlightMarker.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { emitToTeam } from "../sockets";

export const createMarker = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const { teamId, label } = req.body;
  const createdBy = new Types.ObjectId(req.user!.id);

  const event = await Event.findById(eventId);
  if (!event) throw ApiError.notFound("Event not found");

  // Offset is measured from actual start, not scheduled start — a live
  // event rarely starts exactly on schedule, and clip timestamps must
  // match the real recording, not the plan.
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
