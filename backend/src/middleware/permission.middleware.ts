import { Request, Response, NextFunction } from "express";
import { Membership } from "../models/Membership.model";
import { Role } from "../models/Role.model";
import { ApiError } from "../utils/ApiError";
import { WILDCARD_PERMISSION } from "../utils/permissions";

/**
 * Resolves teamId from params, body, or query (in that priority order),
 * loads the caller's membership + role for that team, and attaches it to
 * req.membership for downstream handlers. Super admins bypass entirely.
 */
export function requirePermission(permissionKey: string) {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized();
      }

      if (req.user.isSuperAdmin) {
        return next();
      }

      const teamId =
        (req.params.teamId as string) ||
        (req.body?.teamId as string) ||
        (req.query.teamId as string);

      if (!teamId) {
        throw ApiError.badRequest("teamId is required for this action");
      }

      const membership = await Membership.findOne({
        userId: req.user.id,
        teamId,
        status: "active",
      });

      if (!membership) {
        throw ApiError.forbidden("You are not an active member of this team");
      }

      const role = await Role.findById(membership.roleId);
      if (!role) {
        throw ApiError.forbidden("Role assignment is invalid");
      }

      const hasPermission =
        role.permissions.includes(WILDCARD_PERMISSION) ||
        role.permissions.includes(permissionKey);

      if (!hasPermission) {
        throw ApiError.forbidden(
          `Missing required permission: ${permissionKey}`
        );
      }

      req.membership = {
        teamId: teamId.toString(),
        roleId: role._id.toString(),
        roleName: role.name,
        permissions: role.permissions,
      };

      next();
    } catch (err) {
      next(err);
    }
  };
}
