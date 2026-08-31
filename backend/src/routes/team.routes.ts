import { Router } from "express";
import * as teamController from "../controllers/team.controller";
import { teamChecklistRouter } from "./checklist.routes";
import roleRoutes from "./role.routes";
import inviteRoutes from "./invite.routes";
import { requireAuth } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/permission.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createTeamSchema,
  updateMemberRoleSchema,
  removeMemberSchema,
  updateTeamSchema,
} from "../validators/team.validator";
import { PERMISSIONS } from "../utils/permissions";

const router = Router();

router.use(requireAuth);
router.post("/", validate(createTeamSchema), teamController.createTeam);
router.get("/my", teamController.getMyTeams);
router.get(
  "/:teamId/members",
  requirePermission(PERMISSIONS.TEAM_VIEW),
  teamController.getTeamMembers
);
router.patch(
  "/:teamId",
  validate(updateTeamSchema),
  requirePermission(PERMISSIONS.TEAM_MANAGE),
  teamController.updateTeam
);
router.patch(
  "/:teamId/members/:membershipId/role",
  validate(updateMemberRoleSchema),
  requirePermission(PERMISSIONS.MEMBER_INVITE),
  teamController.updateMemberRole
);
router.delete(
  "/:teamId/members/:membershipId",
  validate(removeMemberSchema),
  requirePermission(PERMISSIONS.MEMBER_REMOVE),
  teamController.removeMember
);
router.use("/:teamId/checklist-templates", teamChecklistRouter);
router.use("/:teamId/roles", roleRoutes);
router.use("/:teamId/invites", inviteRoutes);

export default router;
