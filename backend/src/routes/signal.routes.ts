import { Router } from "express";
import * as signalController from "../controllers/signal.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/permission.middleware";
import { validate } from "../middleware/validate.middleware";
import { sendSignalSchema, acknowledgeSignalSchema } from "../validators/signal.validator";
import { PERMISSIONS } from "../utils/permissions";

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post(
  "/",
  validate(sendSignalSchema),
  requirePermission(PERMISSIONS.SIGNAL_SEND),
  signalController.sendSignal
);

router.get("/", requirePermission(PERMISSIONS.SIGNAL_MANAGE), signalController.getSignals);

router.patch(
  "/:signalId/ack",
  validate(acknowledgeSignalSchema),
  requirePermission(PERMISSIONS.SIGNAL_MANAGE),
  signalController.acknowledgeSignal
);

export default router;
