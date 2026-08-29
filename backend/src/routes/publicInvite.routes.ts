import { Router } from "express";
import * as inviteController from "../controllers/invite.controller";

const router = Router();

router.get("/:token", inviteController.checkInvite);

export default router;
