import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import { Team } from "../models/Team.model";
import { Membership } from "../models/Membership.model";
import { seedDefaultRolesForTeam } from "../services/role.service";
import { asyncHandler } from "../utils/asyncHandler";

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

      const { ownerRoleId } = await seedDefaultRolesForTeam(
        teamId,
        userId,
        session
      );

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
