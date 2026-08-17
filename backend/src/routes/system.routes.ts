import { Router } from "express";
import * as systemController from "../controllers/system.controller";

const router = Router();

router.get("/health", systemController.healthCheck);
router.get("/keep-alive", systemController.keepAlive);

export default router;
