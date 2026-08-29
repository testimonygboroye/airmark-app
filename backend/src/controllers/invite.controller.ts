import { Request, Response } from "express";
import { Types } from "mongoose";
import crypto from "crypto";
import { TeamInvite } from "../models/TeamInvite.model";
import { Membership } from "../models/Membership.model";
import { User } from "../models/User.model";
import { Team } from "../models/Team.model";
import { Role } from "../models/Role.model";
import { generateSecureToken } from "../utils/jwt.util";
import { sendTeamInviteEmail } from "../services/email.service";
import { createNotification } from "../services/notification.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";

export const createInvite = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const teamId = req.params.teamId as string;
  const { email, roleId } = req.body;
  const invitedBy = new Types.ObjectId(req.user!.id);

  const [team, role, inviter] = await Promise.all([
    Team.findById(teamId),
    Role.findOne({ _id: roleId, teamId }),
    User.findById(invitedBy),
  ]);
  if (!team) throw ApiError.notFound("Team not found");
  if (!role) throw ApiError.badRequest("Role not found for this team");

  const existingUser = await User.findOne({ email, isEmailVerified: true });

  if (existingUser) {
    const alreadyMember = await Membership.findOne({ userId: existingUser._id, teamId });
    if (alreadyMember) {
      throw ApiError.conflict("This person is already a member of the team");
    }

    await Membership.create({
      userId: existingUser._id,
      teamId,
      roleId,
      status: "active",
      createdBy: invitedBy,
    });

    await createNotification({
      userId: existingUser._id,
      teamId,
      type: "system",
      title: `You've joined ${team.name}`,
      body: `Added as ${role.name}`,
    });

    res.status(201).json({
      success: true,
      message: `${existingUser.firstName} was added directly — they already have an Airmark account.`,
      data: { type: "added_directly" },
    });
    return;
  }

  const existingInvite = await TeamInvite.findOne({ teamId, email, status: "pending" });
  if (existingInvite) {
    throw ApiError.conflict("An invite is already pending for this email");
  }

  const { raw, hash } = generateSecureToken();
  await TeamInvite.create({
    teamId,
    email,
    roleId,
    invitedBy,
    tokenHash: hash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const inviteUrl = `${env.CLIENT_URL}/register?inviteToken=${raw}&email=${encodeURIComponent(email)}`;
  const inviterName = inviter ? `${inviter.firstName} ${inviter.lastName}` : "A team director";
  await sendTeamInviteEmail(email, team.name, role.name, inviterName, inviteUrl);

  res.status(201).json({
    success: true,
    message: `Invitation sent to ${email}.`,
    data: { type: "invited" },
  });
});

export const checkInvite = asyncHandler(async (req: Request, res: Response) => {
  const token = req.params.token as string;
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const invite = await TeamInvite.findOne({ tokenHash, status: "pending", expiresAt: { $gt: new Date() } })
    .populate("teamId", "name")
    .populate("roleId", "name");

  if (!invite) {
    throw ApiError.notFound("This invitation is invalid or has expired");
  }

  res.json({
    success: true,
    data: {
      teamName: (invite.teamId as any).name,
      roleName: (invite.roleId as any).name,
      email: invite.email,
    },
  });
});

export const listPendingInvites = asyncHandler(async (req: Request, res: Response) => {
  const teamId = req.params.teamId as string;
  const invites = await TeamInvite.find({ teamId, status: "pending" })
    .sort({ createdAt: -1 })
    .populate("roleId", "name");
  res.json({ success: true, data: invites });
});

export const revokeInvite = asyncHandler(async (req: Request, res: Response) => {
  const teamId = req.params.teamId as string;
  const inviteId = req.params.inviteId as string;
  const invite = await TeamInvite.findOneAndDelete({ _id: inviteId, teamId, status: "pending" });
  if (!invite) throw ApiError.notFound("Invite not found");
  res.json({ success: true, message: "Invite revoked" });
});
