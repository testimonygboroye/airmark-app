import { Router } from "express";
import * as pushController from "../controllers/push.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { subscribeSchema, unsubscribeSchema } from "../validators/push.validator";

const router = Router();

router.get("/public-key", pushController.getPublicKey);
router.use(requireAuth);
router.post("/subscribe", validate(subscribeSchema), pushController.subscribe);
router.post("/unsubscribe", validate(unsubscribeSchema), pushController.unsubscribe);

export default router;
