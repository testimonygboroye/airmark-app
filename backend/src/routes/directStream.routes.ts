import { Router } from "express";
import * as directStreamController from "../controllers/directStream.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/permission.middleware";
import { validate } from "../middleware/validate.middleware";
import { saveConfigSchema, teamOnlySchema } from "../validators/directStream.validator";
import { PERMISSIONS } from "../utils/permissions";

const router = Router({ mergeParams: true });
router.use(requireAuth);
router.use(requirePermission(PERMISSIONS.OBS_CONTROL));

router.put("/config", validate(saveConfigSchema), directStreamController.saveConfig);
router.get("/status", directStreamController.getStatus);
router.post("/pair", validate(teamOnlySchema), directStreamController.generatePairingToken);
router.post("/start", validate(teamOnlySchema), directStreamController.startStream);
router.post("/stop", validate(teamOnlySchema), directStreamController.stopStream);

export default router;
