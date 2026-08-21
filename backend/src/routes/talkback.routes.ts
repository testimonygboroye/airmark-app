import { Router } from "express";
import * as talkbackController from "../controllers/talkback.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/permission.middleware";
import { validate } from "../middleware/validate.middleware";
import { sendTalkbackSchema } from "../validators/talkback.validator";
import { PERMISSIONS } from "../utils/permissions";

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post(
  "/",
  validate(sendTalkbackSchema),
  requirePermission(PERMISSIONS.TALKBACK_SEND),
  talkbackController.sendTalkback
);

export default router;
