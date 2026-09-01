import { Router } from "express";
import * as notificationController from "../controllers/notification.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { markReadSchema } from "../validators/notification.validator";

const router = Router();

router.use(requireAuth);

router.get("/", notificationController.listNotifications);
router.get("/:notificationId", validate(markReadSchema), notificationController.getNotification);
router.patch("/:notificationId/read", validate(markReadSchema), notificationController.markAsRead);
router.patch("/:notificationId/unread", validate(markReadSchema), notificationController.markAsUnread);
router.patch("/read-all", notificationController.markAllAsRead);

export default router;
