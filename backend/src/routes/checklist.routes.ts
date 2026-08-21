import { Router } from "express";
import * as checklistController from "../controllers/checklist.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/permission.middleware";
import { validate } from "../middleware/validate.middleware";
import { setTemplateSchema, toggleItemSchema } from "../validators/checklist.validator";
import { PERMISSIONS } from "../utils/permissions";

const teamChecklistRouter = Router({ mergeParams: true });
teamChecklistRouter.use(requireAuth);

teamChecklistRouter.put(
  "/:roleId",
  validate(setTemplateSchema),
  requirePermission(PERMISSIONS.CHECKLIST_MANAGE),
  checklistController.setTemplate
);

teamChecklistRouter.get(
  "/:roleId",
  requirePermission(PERMISSIONS.CHECKLIST_MANAGE),
  checklistController.getTemplate
);

const eventChecklistRouter = Router({ mergeParams: true });
eventChecklistRouter.use(requireAuth);

eventChecklistRouter.get(
  "/mine",
  requirePermission(PERMISSIONS.CHECKLIST_COMPLETE),
  checklistController.getMyEventChecklist
);

eventChecklistRouter.patch(
  "/mine/:itemId",
  validate(toggleItemSchema),
  requirePermission(PERMISSIONS.CHECKLIST_COMPLETE),
  checklistController.toggleItem
);

eventChecklistRouter.get(
  "/readiness",
  requirePermission(PERMISSIONS.CHECKLIST_MANAGE),
  checklistController.getEventReadiness
);

export { teamChecklistRouter, eventChecklistRouter };
