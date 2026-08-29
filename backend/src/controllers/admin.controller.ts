import { Request, Response } from "express";
import { Team } from "../models/Team.model";
import { User } from "../models/User.model";
import { Membership } from "../models/Membership.model";
import { asyncHandler } from "../utils/asyncHandler";

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
