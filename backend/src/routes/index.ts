import { Router } from "express";
import authRoutes from "./auth.routes";
import teamRoutes from "./team.routes";
import systemRoutes from "./system.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/teams", teamRoutes);
router.use("/system", systemRoutes);

export default router;
