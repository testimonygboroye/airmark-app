import { Router } from "express";
import * as publicEventController from "../controllers/publicEvent.controller";

const router = Router();
router.get("/:token", publicEventController.getPublicEvent);
export default router;
