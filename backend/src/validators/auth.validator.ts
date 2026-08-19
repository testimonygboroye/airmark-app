import { z } from "zod";

const nameField = (required: boolean) => {
  const base = z
    .string()
    .trim()
    .max(60)
    .regex(/^[A-Za-z]*$/, "Only letters are allowed");
  return required ? base.min(1, "This field is required") : base.optional().or(z.literal(""));
};

const passwordRules = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128)
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(/[^A-Za-z0-9]/, "Password must contain a special character");

export const registerSchema = z.object({
  body: z
    .object({
      firstName: nameField(true),
      middleName: nameField(false),
      lastName: nameField(true),
      email: z.string().trim().toLowerCase().email(),
      password: passwordRules,
      confirmPassword: z.string().min(1),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(1),
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z
    .object({
      token: z.string().min(1),
      newPassword: passwordRules,
      confirmNewPassword: z.string().min(1),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: "Passwords do not match",
      path: ["confirmNewPassword"],
    }),
});
