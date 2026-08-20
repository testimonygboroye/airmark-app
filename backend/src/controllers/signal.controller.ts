import { Request, Response } from "express";
import { Types } from "mongoose";
import { Signal } from "../models/Signal.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { emitToTeam } from "../sockets";

export const sendSignal = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const { teamId, type, customText } = req.body;
  const fromUserId = new Types.ObjectId(req.user!.id);

  const signal = await Signal.create({
    eventId,
    teamId,
    fromUserId,
    type,
    customText: type === "custom" ? customText : undefined,
  });

  const populated = await signal.populate("fromUserId", "firstName lastName");

  emitToTeam(teamId, "signal:new", { eventId, signal: populated });

  res.status(201).json({ success: true, data: populated });
});

export const getSignals = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;

  const signals = await Signal.find({ eventId })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("fromUserId", "firstName lastName")
    .populate("acknowledgedBy", "firstName lastName");

  res.json({ success: true, data: signals });
});

export const acknowledgeSignal = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const signalId = req.params.signalId as string;
  const { teamId } = req.body;

  const signal = await Signal.findOne({ _id: signalId, eventId });
  if (!signal) throw ApiError.notFound("Signal not found");

  signal.acknowledged = true;
  signal.acknowledgedBy = new Types.ObjectId(req.user!.id);
  signal.acknowledgedAt = new Date();
  await signal.save();

  const populated = await signal.populate([
    { path: "fromUserId", select: "firstName lastName" },
    { path: "acknowledgedBy", select: "firstName lastName" },
  ]);

  emitToTeam(teamId, "signal:ack", { eventId, signal: populated });

  res.json({ success: true, data: populated });
});
