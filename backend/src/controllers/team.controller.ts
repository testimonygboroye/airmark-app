import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import { Team } from "../models/Team.model";
import { Membership } from "../models/Membership.model";
import { Role } from "../models/Role.model";
import { seedDefaultRolesForTeam } from "../services/role.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

function slugify(name: string): string {
  return (
    name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") +
    "-" + Math.random().toString(36).slice(2, 7)
  );
}

export const createTeam = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;
  const userId = new Types.ObjectId(req.user!.id);

  const session = await mongoose.startSession();
  try {
    let teamId: Types.ObjectId;
    await session.withTransaction(async () => {
      const [team] = await Team.create([{ name, slug: slugify(name), createdBy: userId }], { session });
      teamId = team._id as Types.ObjectId;
      const { ownerRoleId } = await seedDefaultRolesForTeam(teamId, userId, session);
      await Membership.create([{ userId, teamId, roleId: ownerRoleId, status: "active", createdBy: userId }], { session });
    });
    res.status(201).json({ success: true, message: "Team created successfully", data: { teamId: teamId! } });
  } finally {
    await session.endSession();
  }
});

export const getMyTeams = asyncHandler(async (req: Request, res: Response) => {
  const memberships = await Membership.find({ userId: req.user!.id, status: "active" }).populate("teamId roleId");
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

  const membership = await Membership.findOne({ _id: membershipId, teamId }).populate("roleId");
  if (!membership) throw ApiError.notFound("Membership not found");

  const currentRole = membership.roleId as any;
  if (currentRole?.name === "Team Owner") {
    throw ApiError.badRequest("Use Transfer Ownership to change who holds the Team Owner role");
  }

  const newRole = await Role.findOne({ _id: roleId, teamId });
  if (!newRole) throw ApiError.badRequest("Role not found for this team");
  if (newRole.name === "Team Owner") {
    throw ApiError.badRequest("Use Transfer Ownership to assign the Team Owner role");
  }
  if (newRole.name === "Director") {
    const existingDirector = await Membership.findOne({ teamId, roleId: newRole._id, status: "active", _id: { $ne: membershipId } });
    if (existingDirector) throw ApiError.conflict("This team already has a Director — only one is allowed at a time.");
  }

  membership.roleId = newRole._id as Types.ObjectId;
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
  if (role?.name === "Team Owner") throw ApiError.badRequest("The Team Owner cannot be removed from their own team");
  if (membership.userId.toString() === req.user!.id) throw ApiError.badRequest("You cannot remove yourself from the team — use Leave Team instead");
  await membership.deleteOne();
  res.json({ success: true, message: "Member removed from team" });
});

export const leaveTeam = asyncHandler(async (req: Request, res: Response) => {
  const teamId = req.params.teamId as string;
  const membership = await Membership.findOne({ userId: req.user!.id, teamId, status: "active" }).populate("roleId");
  if (!membership) throw ApiError.notFound("You are not a member of this team");
  const role = membership.roleId as any;
  if (role?.name === "Team Owner") throw ApiError.badRequest("Transfer ownership to someone else before leaving this team");
  await membership.deleteOne();
  res.json({ success: true, message: "You have left the team" });
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

export const transferOwnershipByEmail = asyncHandler(async (req: Request, res: Response) => {
  const teamId = req.params.teamId as string;
  const { email } = req.body;

  const ownerRole = await Role.findOne({ teamId, name: "Team Owner", isSystemRole: true });
  const directorRole = await Role.findOne({ teamId, name: "Director", isSystemRole: true });
  if (!ownerRole || !directorRole) throw ApiError.notFound("Default roles not found for this team");

  const currentOwnerMembership = await Membership.findOne({ teamId, roleId: ownerRole._id, status: "active" });
  if (!currentOwnerMembership || currentOwnerMembership.userId.toString() !== req.user!.id) {
    throw ApiError.forbidden("Only the current Team Owner can transfer ownership");
  }

  const { User } = await import("../models/User.model");
  const targetUser = await User.findOne({ email, isEmailVerified: true });

  if (targetUser) {
    let targetMembership = await Membership.findOne({ userId: targetUser._id, teamId });
    if (targetMembership) {
      targetMembership.roleId = ownerRole._id as Types.ObjectId;
    } else {
      targetMembership = new Membership({ userId: targetUser._id, teamId, roleId: ownerRole._id, status: "active", createdBy: req.user!.id });
    }
    currentOwnerMembership.roleId = directorRole._id as Types.ObjectId;
    await Promise.all([targetMembership.save(), currentOwnerMembership.save()]);
    res.json({ success: true, message: `Ownership transferred to ${targetUser.firstName}. You are now a Director.` });
    return;
  }

  const { TeamInvite } = await import("../models/TeamInvite.model");
  const { generateSecureToken } = await import("../utils/jwt.util");
  const { sendTeamInviteEmail } = await import("../services/email.service");
  const { env } = await import("../config/env");
  const team = await Team.findById(teamId);

  const { raw, hash } = generateSecureToken();
  await TeamInvite.create({
    teamId, email, roleId: ownerRole._id, invitedBy: req.user!.id, tokenHash: hash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isOwnershipTransfer: true, previousOwnerMembershipId: currentOwnerMembership._id,
  });

  const inviteUrl = `${env.CLIENT_URL}/register?inviteToken=${raw}&email=${encodeURIComponent(email)}`;
  await sendTeamInviteEmail(email, team?.name ?? "your team", "Team Owner", `${req.user!.email}`, inviteUrl);
  res.json({ success: true, message: `${email} isn't an Airmark user yet — an invite was sent. Ownership transfers automatically once they accept.` });
});

export const deleteTeam = asyncHandler(async (req: Request, res: Response) => {
  const teamId = req.params.teamId as string;
  const { confirmationText } = req.body;
  const team = await Team.findById(teamId);
  if (!team) throw ApiError.notFound("Team not found");
  if (confirmationText !== `DELETE ${team.name}`) throw ApiError.badRequest(`You must type exactly "DELETE ${team.name}" to confirm`);

  const otherMembers = await Membership.countDocuments({ teamId, status: "active", userId: { $ne: req.user!.id } });
  if (otherMembers > 0) throw ApiError.badRequest("Remove all other members from this team before deleting it");

  const { Event } = await import("../models/Event.model");
  const { CameraAssignment } = await import("../models/CameraAssignment.model");

  await Promise.all([
    CameraAssignment.deleteMany({ teamId }),
    Event.deleteMany({ teamId }),
    Role.deleteMany({ teamId }),
    Membership.deleteMany({ teamId }),
    Team.findByIdAndDelete(teamId),
  ]);
  res.json({ success: true, message: "Team deleted permanently" });
});
