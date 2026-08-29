import { Router } from "express";
import * as inviteController from "../controllers/invite.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/permission.middleware";
import { validate } from "../middleware/validate.middleware";
import { createInviteSchema } from "../validators/invite.validator";
import { PERMISSIONS } from "../utils/permissions";

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(requirePermission(PERMISSIONS.MEMBER_INVITE));

router.post("/", validate(createInviteSchema), inviteController.createInvite);
router.get("/", inviteController.listPendingInvites);
router.delete("/:inviteId", inviteController.revokeInvite);

export default router;
