import { Request, Response } from "express";
import { Event } from "../models/Event.model";
import { CameraAssignment } from "../models/CameraAssignment.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

export const getPublicEvent = asyncHandler(async (req: Request, res: Response) => {
  const token = req.params.token as string;
  const event = await Event.findOne({ publicShareToken: token });
  if (!event) throw ApiError.notFound("This link is invalid");

  const liveCamera = await CameraAssignment.findOne({ eventId: event._id, isLive: true });

  res.json({
    success: true,
    data: {
      eventId: event._id,
      teamId: event.teamId,
      title: event.title,
      status: event.status,
      liveCameraOperatorUserId: liveCamera?.operatorUserId ?? null,
      liveCameraLabel: liveCamera?.label ?? null,
    },
  });
});
