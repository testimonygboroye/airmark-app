import { Router } from "express";
import * as scheduleController from "../controllers/schedule.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/permission.middleware";
import { validate } from "../middleware/validate.middleware";
import { createAssignmentSchema, deleteAssignmentSchema } from "../validators/schedule.validator";
import { PERMISSIONS } from "../utils/permissions";

const router = Router();

router.use(requireAuth);

router.post(
  "/",
  validate(createAssignmentSchema),
  requirePermission(PERMISSIONS.SCHEDULE_MANAGE),
  scheduleController.createAssignment
);

router.get("/", requirePermission(PERMISSIONS.SCHEDULE_VIEW), scheduleController.getTeamSchedule);
router.get(
  "/mine",
  requirePermission(PERMISSIONS.SCHEDULE_VIEW),
  scheduleController.getMyUpcoming
);

router.delete(
  "/:assignmentId",
  validate(deleteAssignmentSchema),
  requirePermission(PERMISSIONS.SCHEDULE_MANAGE),
  scheduleController.deleteAssignment
);

export default router;
