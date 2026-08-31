import { Router } from "express";
import * as inviteController from "../controllers/invite.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/:token", inviteController.checkInvite);
router.get("/mine/list", requireAuth, inviteController.listMyInvites);
router.post("/:inviteId/accept", requireAuth, inviteController.acceptMyInvite);
router.post("/:inviteId/decline", requireAuth, inviteController.declineMyInvite);

export default router;
