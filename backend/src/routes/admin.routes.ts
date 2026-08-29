import { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireSuperAdmin } from "../middleware/superAdmin.middleware";

const router = Router();

router.use(requireAuth);
router.use(requireSuperAdmin);

router.get("/teams", adminController.getAllTeams);
router.get("/users", adminController.getAllUsers);
router.get("/stats", adminController.getSystemStats);

export default router;
