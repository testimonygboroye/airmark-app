import { z } from "zod";

const NAME_PATTERN = /^[A-Za-z]+(-[A-Za-z]+)*$/;

const nameField = (required: boolean) => {
  const base = z.string().trim().max(60).regex(NAME_PATTERN, "Only letters and hyphens between words are allowed (e.g. El-rufai)");
  return required ? base.min(1, "This field is required") : z.union([base, z.literal("")]).optional();
};

const passwordRules = z.string().min(8, "Password must be at least 8 characters").max(128)
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(/[^A-Za-z0-9]/, "Password must contain a special character");

export const registerSchema = z.object({
  body: z.object({
    firstName: nameField(true), middleName: nameField(false), lastName: nameField(true),
    email: z.string().trim().toLowerCase().email(),
    password: passwordRules, confirmPassword: z.string().min(1), inviteToken: z.string().optional(),
  }).refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] }),
});

export const loginSchema = z.object({ body: z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) }) });
export const verify2FALoginSchema = z.object({ body: z.object({ pendingToken: z.string().min(1), code: z.string().trim().min(6).max(20) }) });
export const verifyEmailSchema = z.object({ body: z.object({ token: z.string().min(1) }) });
export const resendVerificationSchema = z.object({ body: z.object({ email: z.string().trim().toLowerCase().email() }) });
export const forgotPasswordSchema = z.object({ body: z.object({ email: z.string().trim().toLowerCase().email() }) });

export const resetPasswordSchema = z.object({
  body: z.object({ token: z.string().min(1), newPassword: passwordRules, confirmNewPassword: z.string().min(1) })
    .refine((d) => d.newPassword === d.confirmNewPassword, { message: "Passwords do not match", path: ["confirmNewPassword"] }),
});

export const updateProfileSchema = z.object({ body: z.object({ firstName: nameField(true), middleName: nameField(false), lastName: nameField(true) }) });

export const changePasswordSchema = z.object({
  body: z.object({ currentPassword: z.string().min(1), newPassword: passwordRules, confirmNewPassword: z.string().min(1) })
    .refine((d) => d.newPassword === d.confirmNewPassword, { message: "Passwords do not match", path: ["confirmNewPassword"] }),
});

export const confirm2FASchema = z.object({ body: z.object({ code: z.string().trim().min(6).max(10) }) });
export const disable2FASchema = z.object({ body: z.object({ password: z.string().min(1) }) });

export const request2FARecoverySchema = z.object({
  body: z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) }),
});
export const confirm2FARecoverySchema = z.object({
  body: z.object({ token: z.string().min(1), email: z.string().trim().toLowerCase().email(), password: z.string().min(1) }),
});

export const deleteAccountSchema = z.object({ body: z.object({ confirmationText: z.string().min(1), password: z.string().min(1) }) });

export const updateZoomPreferenceSchema = z.object({
  body: z.object({ maxZoomPreference: z.number().min(1).max(50) }),
});
