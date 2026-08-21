import { Request, Response } from "express";
import { Types } from "mongoose";
import { ScheduleAssignment } from "../models/ScheduleAssignment.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

export const createAssignment = asyncHandler(async (req: Request, res: Response) => {
  const { teamId, userId, roleId, date, note } = req.body;
  const createdBy = new Types.ObjectId(req.user!.id);

  const assignment = await ScheduleAssignment.create({
    teamId,
    userId,
    roleId,
    date: new Date(date),
    note,
    createdBy,
  });

  const populated = await assignment.populate([
    { path: "userId", select: "firstName lastName" },
    { path: "roleId", select: "name" },
  ]);

  res.status(201).json({ success: true, data: populated });
});

export const getTeamSchedule = asyncHandler(async (req: Request, res: Response) => {
  const teamId = req.query.teamId as string | undefined;
  if (!teamId) throw ApiError.badRequest("teamId query parameter is required");

  const assignments = await ScheduleAssignment.find({
    teamId,
    date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
  })
    .sort({ date: 1 })
    .populate("userId", "firstName lastName")
    .populate("roleId", "name");

  res.json({ success: true, data: assignments });
});

export const getMyUpcoming = asyncHandler(async (req: Request, res: Response) => {
  const teamId = req.query.teamId as string | undefined;
  if (!teamId) throw ApiError.badRequest("teamId query parameter is required");

  const assignments = await ScheduleAssignment.find({
    teamId,
    userId: req.user!.id,
    date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
  })
    .sort({ date: 1 })
    .limit(5)
    .populate("roleId", "name");

  res.json({ success: true, data: assignments });
});

export const deleteAssignment = asyncHandler(async (req: Request, res: Response) => {
  const assignmentId = req.params.assignmentId as string;
  const assignment = await ScheduleAssignment.findByIdAndDelete(assignmentId);
  if (!assignment) throw ApiError.notFound("Schedule assignment not found");
  res.json({ success: true, message: "Assignment removed" });
});
