import { Router } from "express";
import * as equipmentController from "../controllers/equipment.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/permission.middleware";
import { validate } from "../middleware/validate.middleware";
import { reportIssueSchema, resolveIssueSchema } from "../validators/equipment.validator";
import { PERMISSIONS } from "../utils/permissions";

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post(
  "/",
  validate(reportIssueSchema),
  requirePermission(PERMISSIONS.EQUIPMENT_REPORT),
  equipmentController.reportIssue
);

router.get("/", requirePermission(PERMISSIONS.EQUIPMENT_MANAGE), equipmentController.listIssues);

router.patch(
  "/:issueId/resolve",
  validate(resolveIssueSchema),
  requirePermission(PERMISSIONS.EQUIPMENT_MANAGE),
  equipmentController.resolveIssue
);

export default router;
