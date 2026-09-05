import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middleware/validate.middleware";
import { requireAuth } from "../middleware/auth.middleware";
import { authRateLimiter } from "../middleware/rateLimiter.middleware";
import {
  registerSchema, loginSchema, verify2FALoginSchema, verifyEmailSchema, resendVerificationSchema,
  forgotPasswordSchema, resetPasswordSchema, updateProfileSchema, changePasswordSchema,
  confirm2FASchema, disable2FASchema, request2FARecoverySchema, confirm2FARecoverySchema, deleteAccountSchema,
} from "../validators/auth.validator";

const router = Router();

router.post("/register", authRateLimiter, validate(registerSchema), authController.register);
router.post("/resend-verification", authRateLimiter, validate(resendVerificationSchema), authController.resendVerification);
router.post("/verify-email", authRateLimiter, validate(verifyEmailSchema), authController.verifyEmail);
router.post("/login", authRateLimiter, validate(loginSchema), authController.login);
router.post("/2fa/login-verify", authRateLimiter, validate(verify2FALoginSchema), authController.verify2FALogin);
router.post("/2fa/recovery/request", authRateLimiter, validate(request2FARecoverySchema), authController.request2FARecovery);
router.post("/2fa/recovery/confirm", authRateLimiter, validate(confirm2FARecoverySchema), authController.confirm2FARecovery);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.post("/forgot-password", authRateLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", authRateLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.get("/me", requireAuth, authController.getMe);
router.patch("/me", requireAuth, validate(updateProfileSchema), authController.updateProfile);
router.delete("/me", requireAuth, validate(deleteAccountSchema), authController.deleteAccount);
router.post("/change-password", requireAuth, validate(changePasswordSchema), authController.changePassword);
router.patch("/zoom-preference", requireAuth, validate(updateZoomPreferenceSchema), authController.updateZoomPreference);
router.post("/2fa/setup", requireAuth, authController.setup2FA);
router.post("/2fa/confirm", requireAuth, validate(confirm2FASchema), authController.confirmSetup2FA);
router.post("/2fa/disable", requireAuth, validate(disable2FASchema), authController.disable2FA);

export default router;
