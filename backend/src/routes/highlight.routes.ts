import { Router } from "express";
import * as highlightController from "../controllers/highlight.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/permission.middleware";
import { validate } from "../middleware/validate.middleware";
import { createMarkerSchema } from "../validators/highlight.validator";
import { PERMISSIONS } from "../utils/permissions";

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post(
  "/",
  validate(createMarkerSchema),
  requirePermission(PERMISSIONS.HIGHLIGHT_CREATE),
  highlightController.createMarker
);

router.get("/", requirePermission(PERMISSIONS.HIGHLIGHT_VIEW), highlightController.listMarkers);

export default router;
