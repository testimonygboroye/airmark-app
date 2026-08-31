import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import { Team } from "../models/Team.model";
import { Membership } from "../models/Membership.model";
import { seedDefaultRolesForTeam } from "../services/role.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Math.random().toString(36).slice(2, 7)
  );
}

export const createTeam = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;
  const userId = new Types.ObjectId(req.user!.id);

  const session = await mongoose.startSession();
  try {
    let teamId: Types.ObjectId;

    await session.withTransaction(async () => {
      const [team] = await Team.create(
        [{ name, slug: slugify(name), createdBy: userId }],
        { session }
      );
      teamId = team._id as Types.ObjectId;

      const { ownerRoleId } = await seedDefaultRolesForTeam(teamId, userId, session);

      await Membership.create(
        [
          {
            userId,
            teamId,
            roleId: ownerRoleId,
            status: "active",
            createdBy: userId,
          },
        ],
        { session }
      );
    });

    res.status(201).json({
      success: true,
      message: "Team created successfully",
      data: { teamId: teamId! },
    });
  } finally {
    await session.endSession();
  }
});

export const getMyTeams = asyncHandler(async (req: Request, res: Response) => {
  const memberships = await Membership.find({
    userId: req.user!.id,
    status: "active",
  }).populate("teamId roleId");

  res.json({ success: true, data: memberships });
});

export const getTeamMembers = asyncHandler(async (req: Request, res: Response) => {
  const { teamId } = req.params;

  const memberships = await Membership.find({ teamId, status: "active" })
    .populate("userId", "firstName lastName email")
    .populate("roleId", "name rank");

  res.json({ success: true, data: memberships });
});

export const updateMemberRole = asyncHandler(async (req: Request, res: Response) => {
  const teamId = req.params.teamId as string;
  const membershipId = req.params.membershipId as string;
  const { roleId } = req.body;

  const membership = await Membership.findOne({ _id: membershipId, teamId });
  if (!membership) throw ApiError.notFound("Membership not found");

  membership.roleId = new Types.ObjectId(roleId);
  await membership.save();

  const populated = await membership.populate([
    { path: "userId", select: "firstName lastName email" },
    { path: "roleId", select: "name rank" },
  ]);

  res.json({ success: true, data: populated });
});

export const removeMember = asyncHandler(async (req: Request, res: Response) => {
  const teamId = req.params.teamId as string;
  const membershipId = req.params.membershipId as string;

  const membership = await Membership.findOne({ _id: membershipId, teamId }).populate("roleId");
  if (!membership) throw ApiError.notFound("Membership not found");

  const role = membership.roleId as any;
  if (role?.name === "Team Owner") {
    throw ApiError.badRequest("The Team Owner cannot be removed from their own team");
  }
  if (membership.userId.toString() === req.user!.id) {
    throw ApiError.badRequest("You cannot remove yourself from the team");
  }

  await membership.deleteOne();
  res.json({ success: true, message: "Member removed from team" });
});

export const updateTeam = asyncHandler(async (req: Request, res: Response) => {
  const teamId = req.params.teamId as string;
  const { name } = req.body;

  const team = await Team.findById(teamId);
  if (!team) throw ApiError.notFound("Team not found");

  team.name = name;
  await team.save();

  res.json({ success: true, data: team });
});
