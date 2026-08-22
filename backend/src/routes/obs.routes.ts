import { Router } from "express";
import * as obsController from "../controllers/obs.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/permission.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  pairSchema,
  setSceneSchema,
  setTransitionSchema,
  toggleSceneItemSchema,
} from "../validators/obs.validator";
import { PERMISSIONS } from "../utils/permissions";

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post(
  "/pair",
  validate(pairSchema),
  requirePermission(PERMISSIONS.OBS_CONTROL),
  obsController.generatePairingToken
);

router.get("/status", requirePermission(PERMISSIONS.OBS_CONTROL), obsController.getObsStatus);

router.post(
  "/scene",
  validate(setSceneSchema),
  requirePermission(PERMISSIONS.OBS_CONTROL),
  obsController.setScene
);

router.post(
  "/transition",
  validate(setTransitionSchema),
  requirePermission(PERMISSIONS.OBS_CONTROL),
  obsController.setTransition
);

router.patch(
  "/scene-items/:sceneItemId/toggle",
  validate(toggleSceneItemSchema),
  requirePermission(PERMISSIONS.OBS_CONTROL),
  obsController.toggleSceneItem
);

export default router;
