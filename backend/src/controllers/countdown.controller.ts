import { Request, Response } from "express";
import { Event } from "../models/Event.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { emitToTeam } from "../sockets";

export const startCountdown = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const { teamId, durationSeconds } = req.body;
  const event = await Event.findById(eventId);
  if (!event) throw ApiError.notFound("Event not found");

  const targetAt = new Date(Date.now() + durationSeconds * 1000);
  event.countdownTargetAt = targetAt;
  event.countdownPausedRemainingMs = undefined;
  await event.save();

  emitToTeam(teamId, "countdown:update", { eventId, targetAt: targetAt.toISOString(), paused: false });
  res.json({ success: true, data: { targetAt: targetAt.toISOString() } });
});

export const pauseCountdown = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const { teamId } = req.body;
  const event = await Event.findById(eventId);
  if (!event) throw ApiError.notFound("Event not found");
  if (!event.countdownTargetAt) throw ApiError.badRequest("No active countdown to pause");

  const remainingMs = event.countdownTargetAt.getTime() - Date.now();
  event.countdownPausedRemainingMs = Math.max(0, remainingMs);
  event.countdownTargetAt = undefined;
  await event.save();

  emitToTeam(teamId, "countdown:update", { eventId, targetAt: null, paused: true, pausedRemainingMs: event.countdownPausedRemainingMs });
  res.json({ success: true, data: { pausedRemainingMs: event.countdownPausedRemainingMs } });
});

export const resumeCountdown = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const { teamId } = req.body;
  const event = await Event.findById(eventId);
  if (!event) throw ApiError.notFound("Event not found");
  if (typeof event.countdownPausedRemainingMs !== "number") throw ApiError.badRequest("No paused countdown to resume");

  const targetAt = new Date(Date.now() + event.countdownPausedRemainingMs);
  event.countdownTargetAt = targetAt;
  event.countdownPausedRemainingMs = undefined;
  await event.save();

  emitToTeam(teamId, "countdown:update", { eventId, targetAt: targetAt.toISOString(), paused: false });
  res.json({ success: true, data: { targetAt: targetAt.toISOString() } });
});

export const cancelCountdown = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const { teamId } = req.body;
  const event = await Event.findById(eventId);
  if (!event) throw ApiError.notFound("Event not found");
  event.countdownTargetAt = undefined;
  event.countdownPausedRemainingMs = undefined;
  await event.save();
  emitToTeam(teamId, "countdown:update", { eventId, targetAt: null, paused: false });
  res.json({ success: true, data: { targetAt: null } });
});
