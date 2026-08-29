import { Request, Response } from "express";
import { Types } from "mongoose";
import { Role } from "../models/Role.model";
import { Membership } from "../models/Membership.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

export const listTeamRoles = asyncHandler(async (req: Request, res: Response) => {
  const teamId = req.params.teamId as string;
  const roles = await Role.find({ teamId }).sort({ rank: 1 });
  res.json({ success: true, data: roles });
});

export const createRole = asyncHandler(async (req: Request, res: Response) => {
  const teamId = req.params.teamId as string;
  const { name, rank, permissions } = req.body;
  const createdBy = new Types.ObjectId(req.user!.id);

  const existing = await Role.findOne({ teamId, name });
  if (existing) throw ApiError.conflict("A role with this name already exists for this team");

  const role = await Role.create({
    teamId,
    name,
    rank,
    permissions,
    isSystemRole: false,
    createdBy,
  });

  res.status(201).json({ success: true, data: role });
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const teamId = req.params.teamId as string;
  const roleId = req.params.roleId as string;
  const { name, rank, permissions } = req.body;

  const role = await Role.findOne({ _id: roleId, teamId });
  if (!role) throw ApiError.notFound("Role not found");

  if (role.isSystemRole && role.name === "Team Owner") {
    throw ApiError.badRequest("The Team Owner role's permissions cannot be modified — it must always retain full control");
  }

  if (name !== undefined) role.name = name;
  if (rank !== undefined) role.rank = rank;
  if (permissions !== undefined) role.permissions = permissions;
  await role.save();

  res.json({ success: true, data: role });
});

export const deleteRole = asyncHandler(async (req: Request, res: Response) => {
  const teamId = req.params.teamId as string;
  const roleId = req.params.roleId as string;

  const role = await Role.findOne({ _id: roleId, teamId });
  if (!role) throw ApiError.notFound("Role not found");
  if (role.isSystemRole) throw ApiError.badRequest("Built-in roles cannot be deleted");

  const inUse = await Membership.countDocuments({ roleId, status: "active" });
  if (inUse > 0) throw ApiError.badRequest(`Cannot delete — ${inUse} member(s) currently hold this role`);

  await role.deleteOne();
  res.json({ success: true, message: "Role deleted" });
});
