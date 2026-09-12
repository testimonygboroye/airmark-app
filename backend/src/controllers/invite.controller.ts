import { Request, Response } from "express";
import { Types } from "mongoose";
import crypto from "crypto";
import { TeamInvite } from "../models/TeamInvite.model";
import { Notification } from "../models/Notification.model";
import { Membership } from "../models/Membership.model";
import { Role } from "../models/Role.model";
import { User } from "../models/User.model";
import { Team } from "../models/Team.model";
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

  const [team, role, inviter] = await Promise.all([Team.findById(teamId), Role.findOne({ _id: roleId, teamId }), User.findById(invitedBy)]);
  if (!team) throw ApiError.notFound("Team not found");
  if (!role) throw ApiError.badRequest("Role not found for this team");

  if (role.name === "Director") {
    const existingDirector = await Membership.findOne({ teamId, roleId, status: "active" });
    if (existingDirector) throw ApiError.conflict("This team already has a Director — only one is allowed at a time.");
  }

  const existingUser = await User.findOne({ email, isEmailVerified: true });
  if (existingUser) {
    const alreadyMember = await Membership.findOne({ userId: existingUser._id, teamId });
    if (alreadyMember) throw ApiError.conflict("This person is already a member of the team");
  }

  const existingInvite = await TeamInvite.findOne({ teamId, email, status: "pending" });
  if (existingInvite) throw ApiError.conflict("An invite is already pending for this email");

  const { raw, hash } = generateSecureToken();
  const invite = await TeamInvite.create({
    teamId, email, roleId, invitedBy, tokenHash: hash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const inviterName = inviter ? `${inviter.firstName} ${inviter.lastName}` : "A team director";

  if (existingUser) {
    await createNotification({
      userId: existingUser._id,
      teamId,
      type: "system",
      title: `Invitation to join ${team.name}`,
      body: `${inviterName} invited you as ${role.name}. Open Invites to accept or decline.`,
      relatedInviteId: invite._id,
    });
    res.status(201).json({ success: true, message: `${existingUser.firstName} was notified and can accept from their Invites page.`, data: { type: "notified_in_app" } });
    return;
  }

  const inviteUrl = `${env.CLIENT_URL}/register?inviteToken=${raw}&email=${encodeURIComponent(email)}`;
  await sendTeamInviteEmail(email, team.name, role.name, inviterName, inviteUrl);
  res.status(201).json({ success: true, message: `Invitation email sent to ${email}.`, data: { type: "invited" } });
});

export const checkInvite = asyncHandler(async (req: Request, res: Response) => {
  const token = req.params.token as string;
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const invite = await TeamInvite.findOne({ tokenHash, status: "pending", expiresAt: { $gt: new Date() } }).populate("teamId", "name").populate("roleId", "name");
  if (!invite) throw ApiError.notFound("This invitation is invalid or has expired");
  res.json({ success: true, data: { teamName: (invite.teamId as any).name, roleName: (invite.roleId as any).name, email: invite.email } });
});

export const listPendingInvites = asyncHandler(async (req: Request, res: Response) => {
  const teamId = req.params.teamId as string;
  const invites = await TeamInvite.find({ teamId, status: "pending" }).sort({ createdAt: -1 }).populate("roleId", "name");
  res.json({ success: true, data: invites });
});

export const revokeInvite = asyncHandler(async (req: Request, res: Response) => {
  const teamId = req.params.teamId as string;
  const inviteId = req.params.inviteId as string;
  const invite = await TeamInvite.findOneAndDelete({ _id: inviteId, teamId, status: "pending" });
  if (!invite) throw ApiError.notFound("Invite not found");
  res.json({ success: true, message: "Invite revoked" });
});

export const listMyInvites = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound("User not found");
  const invites = await TeamInvite.find({ email: user.email, status: "pending", expiresAt: { $gt: new Date() } })
    .populate("teamId", "name").populate("roleId", "name").populate("invitedBy", "firstName lastName");
  res.json({ success: true, data: invites });
});

export const acceptMyInvite = asyncHandler(async (req: Request, res: Response) => {
  const inviteId = req.params.inviteId as string;
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound("User not found");
  const invite = await TeamInvite.findOne({ _id: inviteId, email: user.email, status: "pending" });
  if (!invite) throw ApiError.notFound("Invite not found or already responded to");
  if (invite.expiresAt < new Date()) throw ApiError.badRequest("This invite has expired");

  const alreadyMember = await Membership.findOne({ userId: user._id, teamId: invite.teamId });
  if (alreadyMember) throw ApiError.conflict("You are already a member of this team");

  await Membership.create({ userId: user._id, teamId: invite.teamId, roleId: invite.roleId, status: "active", createdBy: invite.invitedBy });

  if (invite.isOwnershipTransfer && invite.previousOwnerMembershipId) {
    const directorRole = await Role.findOne({ teamId: invite.teamId, name: "Director", isSystemRole: true });
    if (directorRole) await Membership.findByIdAndUpdate(invite.previousOwnerMembershipId, { roleId: directorRole._id });
  }

  invite.status = "accepted";
  await invite.save();

  // Marks the original invite notification read automatically — the
  // person just acted on it, so it shouldn't linger as "unread" until
  // they separately clear it themselves.
  await Notification.updateMany({ userId: user._id, relatedInviteId: invite._id }, { read: true });

  res.json({ success: true, message: invite.isOwnershipTransfer ? "You are now Team Owner." : "You've joined the team." });
});

export const declineMyInvite = asyncHandler(async (req: Request, res: Response) => {
  const inviteId = req.params.inviteId as string;
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound("User not found");
  const invite = await TeamInvite.findOneAndDelete({ _id: inviteId, email: user.email, status: "pending" });
  if (!invite) throw ApiError.notFound("Invite not found");
  await Notification.updateMany({ userId: user._id, relatedInviteId: invite._id }, { read: true });
  res.json({ success: true, message: "Invite declined" });
});
