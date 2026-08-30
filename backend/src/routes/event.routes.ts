import { Router } from "express";
import * as eventController from "../controllers/event.controller";
import runOfShowRoutes from "./runOfShow.routes";
import countdownRoutes from "./countdown.routes";
import signalRoutes from "./signal.routes";
import talkbackRoutes from "./talkback.routes";
import highlightRoutes from "./highlight.routes";
import equipmentRoutes from "./equipment.routes";
import obsRoutes from "./obs.routes";
import { eventChecklistRouter } from "./checklist.routes";
import { requireAuth } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/permission.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createEventSchema,
  setTallySchema,
  assignOperatorSchema,
  eventStatusSchema,
} from "../validators/event.validator";
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

router.delete(
  "/:eventId",
  requirePermission(PERMISSIONS.EVENT_MANAGE),
  eventController.deleteEvent
);

router.post(
  "/:eventId/cameras/:cameraId/live",
  validate(setTallySchema),
  requirePermission(PERMISSIONS.TALLY_CONTROL),
  eventController.setLiveCamera
);

router.patch(
  "/:eventId/cameras/:cameraId/assign",
  validate(assignOperatorSchema),
  requirePermission(PERMISSIONS.EVENT_MANAGE),
  eventController.assignOperator
);

router.post(
  "/:eventId/start",
  validate(eventStatusSchema),
  requirePermission(PERMISSIONS.EVENT_MANAGE),
  eventController.startEvent
);

router.post(
  "/:eventId/end",
  validate(eventStatusSchema),
  requirePermission(PERMISSIONS.EVENT_MANAGE),
  eventController.endEvent
);

router.use("/:eventId/segments", runOfShowRoutes);
router.use("/:eventId/countdown", countdownRoutes);
router.use("/:eventId/signals", signalRoutes);
router.use("/:eventId/talkback", talkbackRoutes);
router.use("/:eventId/highlights", highlightRoutes);
router.use("/:eventId/equipment", equipmentRoutes);
router.use("/:eventId/checklist", eventChecklistRouter);
router.use("/:eventId/obs", obsRoutes);

export default router;
