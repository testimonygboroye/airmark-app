import { Request, Response } from "express";
import { Team } from "../models/Team.model";
import { User } from "../models/User.model";
import { Membership } from "../models/Membership.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/User.model";

export const getAllTeams = asyncHandler(async (_req: Request, res: Response) => {
  const teams = await Team.find().sort({ createdAt: -1 }).populate("createdBy", "firstName lastName email");

  const memberCounts = await Membership.aggregate([
    { $match: { status: "active" } },
    { $group: { _id: "$teamId", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(memberCounts.map((m) => [m._id.toString(), m.count]));

  const enriched = teams.map((team) => ({
    _id: team._id,
    name: team.name,
    slug: team.slug,
    createdBy: team.createdBy,
    createdAt: team.createdAt,
    memberCount: countMap.get(team._id.toString()) ?? 0,
  }));

  res.json({ success: true, data: enriched });
});

export const getAllUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await User.find().sort({ createdAt: -1 }).select(
    "firstName middleName lastName email isSuperAdmin isEmailVerified createdAt"
  );
  res.json({ success: true, data: users });
});

export const getSystemStats = asyncHandler(async (_req: Request, res: Response) => {
  const [teamCount, userCount, verifiedCount] = await Promise.all([
    Team.countDocuments(),
    User.countDocuments(),
    User.countDocuments({ isEmailVerified: true }),
  ]);
  res.json({
    success: true,
    data: { teamCount, userCount, verifiedCount, unverifiedCount: userCount - verifiedCount },
  });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.userId as string;

  if (userId === req.user!.id) {
    throw ApiError.badRequest("Use Profile > Delete my account to delete your own account");
  }

  const { Membership } = await import("../models/Membership.model");
  const { RefreshToken } = await import("../models/RefreshToken.model");

  await Promise.all([
    Membership.deleteMany({ userId }),
    RefreshToken.deleteMany({ userId }),
    User.findByIdAndDelete(userId),
  ]);

  res.json({ success: true, message: "User deleted" });
});
