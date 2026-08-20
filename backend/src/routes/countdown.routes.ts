import { Router } from "express";
import * as countdownController from "../controllers/countdown.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/permission.middleware";
import { validate } from "../middleware/validate.middleware";
import { startCountdownSchema, cancelCountdownSchema } from "../validators/countdown.validator";
import { PERMISSIONS } from "../utils/permissions";

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post(
  "/start",
  validate(startCountdownSchema),
  requirePermission(PERMISSIONS.COUNTDOWN_CONTROL),
  countdownController.startCountdown
);

router.post(
  "/cancel",
  validate(cancelCountdownSchema),
  requirePermission(PERMISSIONS.COUNTDOWN_CONTROL),
  countdownController.cancelCountdown
);

export default router;
