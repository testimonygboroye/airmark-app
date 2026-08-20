import { Router } from "express";
import authRoutes from "./auth.routes";
import teamRoutes from "./team.routes";
import systemRoutes from "./system.routes";
import eventRoutes from "./event.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/teams", teamRoutes);
router.use("/system", systemRoutes);
router.use("/events", eventRoutes);

export default router;
