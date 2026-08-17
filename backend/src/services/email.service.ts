import axios from "axios";
import { env } from "../config/env";

const brevoClient = axios.create({
  baseURL: "https://api.brevo.com/v3",
  headers: {
    "api-key": env.BREVO_API_KEY,
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
});

interface SendEmailParams {
  to: string;
  toName?: string;
  subject: string;
  htmlContent: string;
}

export async function sendTransactionalEmail({
  to,
  toName,
  subject,
  htmlContent,
}: SendEmailParams): Promise<void> {
  await brevoClient.post("/smtp/email", {
    sender: { email: env.BREVO_SENDER_EMAIL, name: env.BREVO_SENDER_NAME },
    to: [{ email: to, name: toName || to }],
    subject,
    htmlContent,
  });
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  verifyUrl: string
): Promise<void> {
  await sendTransactionalEmail({
    to,
    toName: name,
    subject: "Verify your Airmark account",
    htmlContent: `
      <div style="font-family: -apple-system, Arial, sans-serif; background:#0B0F14; padding:32px; color:#F7F8FA;">
        <h1 style="color:#2DB6C4; font-size:20px;">Welcome to Airmark, ${name}.</h1>
        <p style="font-size:15px; line-height:1.6;">
          Confirm your email address to activate your account and start
          coordinating your live production team.
        </p>
        <a href="${verifyUrl}"
           style="display:inline-block; margin-top:16px; padding:12px 24px;
                  background:#E4293B; color:#ffffff; text-decoration:none;
                  border-radius:6px; font-weight:600;">
          Verify Email
        </a>
        <p style="font-size:12px; color:#3A4A5C; margin-top:24px;">
          If you did not create this account, you can safely ignore this email.
          This link expires in 24 hours.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string
): Promise<void> {
  await sendTransactionalEmail({
    to,
    toName: name,
    subject: "Reset your Airmark password",
    htmlContent: `
      <div style="font-family: -apple-system, Arial, sans-serif; background:#0B0F14; padding:32px; color:#F7F8FA;">
        <h1 style="color:#2DB6C4; font-size:20px;">Password reset requested</h1>
        <p style="font-size:15px; line-height:1.6;">
          Click below to set a new password for your Airmark account, ${name}.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block; margin-top:16px; padding:12px 24px;
                  background:#E4293B; color:#ffffff; text-decoration:none;
                  border-radius:6px; font-weight:600;">
          Reset Password
        </a>
        <p style="font-size:12px; color:#3A4A5C; margin-top:24px;">
          If you did not request this, you can safely ignore this email.
          This link expires in 1 hour.
        </p>
      </div>
    `,
  });
}

/**
 * Fetches account info from Brevo. Costs nothing, sends no email — used
 * purely to register genuine API activity so Brevo's 90-day inactivity
 * expiry (even on no-expiry keys) never triggers. Called by the daily
 * keep-alive route.
 */
export async function pingBrevoAccount(): Promise<{ email: string }> {
  const response = await brevoClient.get("/account");
  return { email: response.data.email };
}
