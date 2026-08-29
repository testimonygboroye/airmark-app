import { Router } from "express";
import * as notificationController from "../controllers/notification.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { markReadSchema } from "../validators/notification.validator";

const router = Router();

router.use(requireAuth);

router.get("/", notificationController.listNotifications);
router.patch("/:notificationId/read", validate(markReadSchema), notificationController.markAsRead);
router.patch("/read-all", notificationController.markAllAsRead);

export default router;
