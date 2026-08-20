import { Router } from "express";
import * as eventController from "../controllers/event.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/permission.middleware";
import { validate } from "../middleware/validate.middleware";
import { createEventSchema, setTallySchema } from "../validators/event.validator";
import { PERMISSIONS } from "../utils/permissions";

const router = Router();

router.use(requireAuth);

router.post(
  "/",
  validate(createEventSchema),
  requirePermission(PERMISSIONS.EVENT_CREATE),
  eventController.createEvent
);

router.get("/", eventController.getTeamEvents);
router.get("/:eventId", eventController.getEventDetail);

router.post(
  "/:eventId/cameras/:cameraId/live",
  validate(setTallySchema),
  requirePermission(PERMISSIONS.TALLY_CONTROL),
  eventController.setLiveCamera
);

export default router;
