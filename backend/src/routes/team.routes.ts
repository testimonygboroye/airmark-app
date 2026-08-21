import { Router } from "express";
import * as teamController from "../controllers/team.controller";
import { teamChecklistRouter } from "./checklist.routes";
import { requireAuth } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/permission.middleware";
import { validate } from "../middleware/validate.middleware";
import { createTeamSchema } from "../validators/team.validator";
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
router.use("/:teamId/checklist-templates", teamChecklistRouter);

export default router;
