import { Router } from "express";
import authRoutes from "./auth.routes";
import teamRoutes from "./team.routes";
import systemRoutes from "./system.routes";
import eventRoutes from "./event.routes";
import scheduleRoutes from "./schedule.routes";
import adminRoutes from "./admin.routes";
import notificationRoutes from "./notification.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/teams", teamRoutes);
router.use("/system", systemRoutes);
router.use("/events", eventRoutes);
router.use("/schedule", scheduleRoutes);
router.use("/admin", adminRoutes);
router.use("/notifications", notificationRoutes);

export default router;
