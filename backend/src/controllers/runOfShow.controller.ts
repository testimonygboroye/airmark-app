import { Request, Response } from "express";
import { Types } from "mongoose";
import { RunOfShowSegment } from "../models/RunOfShowSegment.model";
import { Event } from "../models/Event.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { emitToTeam } from "../sockets";

/**
 * Replaces the entire run-of-show for an event in one call — simplest,
 * least error-prone way to let a director build or reorder the segment
 * list from a setup-mode UI without needing separate reorder/delete
 * endpoints for a first version of this feature.
 */
export const setSegments = asyncHandler(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const { teamId, segments } = req.body;

  const event = await Event.findById(eventId);
  if (!event) throw ApiError.notFound("Event not found");

  await RunOfShowSegment.deleteMany({ eventId });

  const docs = segments.map((s: { title: string; notes?: string }, i: number) => ({
    eventId,
    teamId,
    order: i,
    title: s.title,
    notes: s.notes || undefined,
  }));

  const created = await RunOfShowSegment.insertMany(docs);

  // If the previously-current segment was removed by this replace, clear it.
  const stillExists = created.some(
    (s) => s._id.toString() === event.currentSegmentId?.toString()
  );
  if (!stillExists && event.currentSegmentId) {
    event.currentSegmentId = undefined;
    await event.save();
  }

  emitToTeam(teamId, "ros:segments-updated", { eventId, segments: created });

  res.status(201).json({ success: true, data: created });
});

export const getSegments = asyncHandler(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const segments = await RunOfShowSegment.find({ eventId }).sort({ order: 1 });
  res.json({ success: true, data: segments });
});

/**
 * Sets the current "Now" segment and broadcasts it in real time — the
 * core mechanic this feature exists for: every phone updates instantly
 * without anyone shouting across the room.
 */
export const setCurrentSegment = asyncHandler(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const { teamId, segmentId } = req.body;

  const event = await Event.findById(eventId);
  if (!event) throw ApiError.notFound("Event not found");

  if (segmentId) {
    const segment = await RunOfShowSegment.findOne({ _id: segmentId, eventId });
    if (!segment) throw ApiError.notFound("Segment not found for this event");
  }

  event.currentSegmentId = segmentId ? new Types.ObjectId(segmentId) : undefined;
  await event.save();

  const segments = await RunOfShowSegment.find({ eventId }).sort({ order: 1 });
  const currentIndex = segments.findIndex((s) => s._id.toString() === segmentId);
  const nextSegment = currentIndex >= 0 ? segments[currentIndex + 1] ?? null : null;
  const currentSegment = currentIndex >= 0 ? segments[currentIndex] : null;

  emitToTeam(teamId, "ros:update", {
    eventId,
    currentSegment,
    nextSegment,
  });

  res.json({ success: true, data: { currentSegment, nextSegment } });
});
