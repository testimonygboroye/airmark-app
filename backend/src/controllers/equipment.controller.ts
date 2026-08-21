import { Request, Response } from "express";
import { Types } from "mongoose";
import { EquipmentStatus } from "../models/EquipmentStatus.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { emitToTeam } from "../sockets";

export const reportIssue = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const { teamId, cameraId, issueType, note } = req.body;
  const reportedBy = new Types.ObjectId(req.user!.id);

  const issue = await EquipmentStatus.create({
    eventId,
    teamId,
    cameraId,
    reportedBy,
    issueType,
    note,
  });

  const populated = await issue.populate("reportedBy", "firstName lastName");

  emitToTeam(teamId, "equipment:new", { eventId, issue: populated });

  res.status(201).json({ success: true, data: populated });
});

export const listIssues = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;

  const issues = await EquipmentStatus.find({ eventId })
    .sort({ createdAt: -1 })
    .populate("reportedBy", "firstName lastName")
    .populate("resolvedBy", "firstName lastName");

  res.json({ success: true, data: issues });
});

export const resolveIssue = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const issueId = req.params.issueId as string;
  const { teamId } = req.body;

  const issue = await EquipmentStatus.findOne({ _id: issueId, eventId });
  if (!issue) throw ApiError.notFound("Equipment issue not found");

  issue.status = "resolved";
  issue.resolvedBy = new Types.ObjectId(req.user!.id);
  issue.resolvedAt = new Date();
  await issue.save();

  const populated = await issue.populate([
    { path: "reportedBy", select: "firstName lastName" },
    { path: "resolvedBy", select: "firstName lastName" },
  ]);

  emitToTeam(teamId, "equipment:resolved", { eventId, issue: populated });

  res.json({ success: true, data: populated });
});
