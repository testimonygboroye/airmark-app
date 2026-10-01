import { Router } from "express";
import * as obsController from "../controllers/obs.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/permission.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  pairSchema,
  setSceneSchema,
  setTransitionSchema,
  toggleSceneItemSchema,
  setTextSourceSchema,
  setFallbackSceneSchema,
  teamOnlySchema,
  setWatermarkSchema,
  startCountdownOverlaySchema,
  audioMuteSchema,
  audioVolumeSchema,
  setFavoritesSchema,
  setIntroOutroSchema,
} from "../validators/obs.validator";
import { PERMISSIONS } from "../utils/permissions";

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(requirePermission(PERMISSIONS.OBS_CONTROL));

router.post("/pair", validate(pairSchema), obsController.generatePairingToken);
router.get("/status", obsController.getObsStatus);
router.post("/disconnect", obsController.disconnectBridge);
router.post("/scene", validate(setSceneSchema), obsController.setScene);
router.post("/transition", validate(setTransitionSchema), obsController.setTransition);
router.patch("/scene-items/:sceneItemId/toggle", validate(toggleSceneItemSchema), obsController.toggleSceneItem);
router.post("/text", validate(setTextSourceSchema), obsController.setTextSource);
router.post("/fallback-scene", validate(setFallbackSceneSchema), obsController.setFallbackScene);
router.post("/fallback-scene/trigger", validate(teamOnlySchema), obsController.triggerFallback);
router.post("/stream/start", validate(teamOnlySchema), obsController.startStream);
router.post("/stream/stop", validate(teamOnlySchema), obsController.stopStream);
router.post("/record/start", validate(teamOnlySchema), obsController.startRecord);
router.post("/record/stop", validate(teamOnlySchema), obsController.stopRecord);
router.post("/watermark", validate(setWatermarkSchema), obsController.setWatermarkSource);
router.patch("/watermark/toggle", validate(toggleSceneItemSchema), obsController.toggleWatermark);
router.post("/countdown-overlay/start", validate(startCountdownOverlaySchema), obsController.startCountdownOverlay);
router.post("/countdown-overlay/stop", validate(teamOnlySchema), obsController.stopCountdownOverlay);
router.patch("/audio/mute", validate(audioMuteSchema), obsController.setAudioMute);
router.patch("/audio/volume", validate(audioVolumeSchema), obsController.setAudioVolume);
router.get("/audio/sources", obsController.getAudioSources);
router.post("/replay-buffer/start", validate(teamOnlySchema), obsController.startReplayBuffer);
router.post("/replay-buffer/save", validate(teamOnlySchema), obsController.saveReplayBuffer);
router.put("/favorites", validate(setFavoritesSchema), obsController.setFavoriteOverlays);
router.put("/intro-outro", validate(setIntroOutroSchema), obsController.setIntroOutro);

export default router;
