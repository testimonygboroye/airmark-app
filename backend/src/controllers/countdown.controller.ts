import { Request, Response } from "express";
import { Event } from "../models/Event.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { emitToTeam } from "../sockets";

export const startCountdown = asyncHandler(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const { teamId, durationSeconds } = req.body;

  const event = await Event.findById(eventId);
  if (!event) throw ApiError.notFound("Event not found");

  const targetAt = new Date(Date.now() + durationSeconds * 1000);
  event.countdownTargetAt = targetAt;
  await event.save();

  // Broadcasting one absolute timestamp, not a ticking "seconds remaining"
  // value — every connected phone computes its own remaining time locally
  // against this fixed point, so network latency can't cause drift between
  // devices.
  emitToTeam(teamId, "countdown:update", {
    eventId,
    targetAt: targetAt.toISOString(),
  });

  res.json({ success: true, data: { targetAt: targetAt.toISOString() } });
});

export const cancelCountdown = asyncHandler(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const { teamId } = req.body;

  const event = await Event.findById(eventId);
  if (!event) throw ApiError.notFound("Event not found");

  event.countdownTargetAt = undefined;
  await event.save();

  emitToTeam(teamId, "countdown:update", { eventId, targetAt: null });

  res.json({ success: true, data: { targetAt: null } });
});
