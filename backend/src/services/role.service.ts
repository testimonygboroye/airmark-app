import { Types, ClientSession } from "mongoose";
import { Role } from "../models/Role.model";
import { DEFAULT_TEAM_ROLES } from "../utils/permissions";

/**
 * Seeds the default role set for a newly created team. Roles remain fully
 * editable afterward via the admin panel — this only establishes sane
 * starting defaults, per the dynamic/data-driven role system requirement.
 */
export async function seedDefaultRolesForTeam(
  teamId: Types.ObjectId,
  createdBy: Types.ObjectId,
  session?: ClientSession
): Promise<{ ownerRoleId: Types.ObjectId }> {
  const docs = DEFAULT_TEAM_ROLES.map((r) => ({
    teamId,
    name: r.name,
    rank: r.rank,
    permissions: r.permissions,
    isSystemRole: r.isSystemRole,
    createdBy,
  }));

  const created = await Role.insertMany(docs, { session });
  const ownerRole = created.find((r) => r.name === "Team Owner");
  if (!ownerRole) {
    throw new Error("Failed to seed Team Owner role");
  }
  return { ownerRoleId: ownerRole._id as Types.ObjectId };
}
