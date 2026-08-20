import { Router } from "express";
import * as rosController from "../controllers/runOfShow.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/permission.middleware";
import { validate } from "../middleware/validate.middleware";
import { setSegmentsSchema, setCurrentSegmentSchema } from "../validators/runOfShow.validator";
import { PERMISSIONS } from "../utils/permissions";

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get("/", rosController.getSegments);

router.put(
  "/",
  validate(setSegmentsSchema),
  requirePermission(PERMISSIONS.ROS_MANAGE),
  rosController.setSegments
);

router.patch(
  "/current",
  validate(setCurrentSegmentSchema),
  requirePermission(PERMISSIONS.ROS_CONTROL),
  rosController.setCurrentSegment
);

export default router;
