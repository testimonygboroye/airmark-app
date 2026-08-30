import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import { Event } from "../models/Event.model";
import { CameraAssignment } from "../models/CameraAssignment.model";
import { RunOfShowSegment } from "../models/RunOfShowSegment.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { emitToTeam } from "../sockets";
import { notifyEditorsOfHighlights } from "./highlight.controller";

export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const { teamId, title, scheduledStart, cameraCount } = req.body;
  const userId = new Types.ObjectId(req.user!.id);

  const session = await mongoose.startSession();
  try {
    let eventId: Types.ObjectId;

    await session.withTransaction(async () => {
      const [event] = await Event.create(
        [{ teamId, title, scheduledStart: new Date(scheduledStart), createdBy: userId }],
        { session }
      );
      eventId = event._id as Types.ObjectId;

      const cameraDocs = Array.from({ length: cameraCount }, (_, i) => ({
        eventId,
        teamId,
        cameraNumber: i + 1,
        label: `Camera ${i + 1}`,
        isLive: false,
      }));

      await CameraAssignment.insertMany(cameraDocs, { session });
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: { eventId: eventId! },
    });
  } finally {
    await session.endSession();
  }
});

export const getTeamEvents = asyncHandler(async (req: Request, res: Response) => {
  const teamId = req.query.teamId as string | undefined;
  if (!teamId) throw ApiError.badRequest("teamId query parameter is required");

  const events = await Event.find({ teamId }).sort({ scheduledStart: -1 });
  res.json({ success: true, data: events });
});

export const getEventDetail = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;

  const event = await Event.findById(eventId);
  if (!event) throw ApiError.notFound("Event not found");

  const cameras = await CameraAssignment.find({ eventId })
    .sort({ cameraNumber: 1 })
    .populate("operatorUserId", "firstName lastName email");

  const segments = await RunOfShowSegment.find({ eventId }).sort({ order: 1 });
  const currentIndex = segments.findIndex(
    (s) => s._id.toString() === event.currentSegmentId?.toString()
  );
  const currentSegment = currentIndex >= 0 ? segments[currentIndex] : null;
  const nextSegment = currentIndex >= 0 ? segments[currentIndex + 1] ?? null : null;

  res.json({
    success: true,
    data: {
      event,
      cameras,
      segments,
      currentSegment,
      nextSegment,
      countdownTargetAt: event.countdownTargetAt ?? null,
    },
  });
});

export const setLiveCamera = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const cameraId = req.params.cameraId as string;
  const { teamId } = req.body;

  const target = await CameraAssignment.findOne({ _id: cameraId, eventId });
  if (!target) throw ApiError.notFound("Camera assignment not found");

  await CameraAssignment.updateMany({ eventId }, { isLive: false });
  target.isLive = true;
  await target.save();

  const cameras = await CameraAssignment.find({ eventId })
    .sort({ cameraNumber: 1 })
    .populate("operatorUserId", "firstName lastName email");

  emitToTeam(teamId, "tally:update", {
    eventId,
    liveCameraId: target._id.toString(),
    cameras,
  });

  res.json({ success: true, data: { cameras } });
});

export const assignOperator = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const cameraId = req.params.cameraId as string;
  const { teamId, operatorUserId } = req.body;

  const target = await CameraAssignment.findOne({ _id: cameraId, eventId });
  if (!target) throw ApiError.notFound("Camera assignment not found");

  target.operatorUserId = operatorUserId ? new Types.ObjectId(operatorUserId) : undefined;
  await target.save();

  const cameras = await CameraAssignment.find({ eventId })
    .sort({ cameraNumber: 1 })
    .populate("operatorUserId", "firstName lastName email");

  emitToTeam(teamId, "cameras:update", { eventId, cameras });

  res.json({ success: true, data: { cameras } });
});

export const startEvent = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const { teamId } = req.body;

  const event = await Event.findById(eventId);
  if (!event) throw ApiError.notFound("Event not found");

  event.status = "live";
  event.actualStartAt = event.actualStartAt ?? new Date();
  await event.save();

  emitToTeam(teamId, "event:status-update", {
    eventId,
    status: event.status,
    actualStartAt: event.actualStartAt,
  });

  res.json({ success: true, data: { status: event.status, actualStartAt: event.actualStartAt } });
});

export const endEvent = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const { teamId } = req.body;

  const event = await Event.findById(eventId);
  if (!event) throw ApiError.notFound("Event not found");

  event.status = "ended";
  event.endedAt = new Date();
  await event.save();

  emitToTeam(teamId, "event:status-update", {
    eventId,
    status: event.status,
    endedAt: event.endedAt,
  });

  await notifyEditorsOfHighlights(eventId, teamId, event.title);

  res.json({ success: true, data: { status: event.status, endedAt: event.endedAt } });
});

export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const event = await Event.findById(eventId);
  if (!event) throw ApiError.notFound("Event not found");
  if (event.status === "live") throw ApiError.badRequest("Cannot delete an event that is currently live");

  await Promise.all([
    CameraAssignment.deleteMany({ eventId }),
    RunOfShowSegment.deleteMany({ eventId }),
    event.deleteOne(),
  ]);

  res.json({ success: true, message: "Event deleted" });
});
