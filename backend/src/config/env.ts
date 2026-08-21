import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function required(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),
  IS_PRODUCTION: process.env.NODE_ENV === "production",

  MONGODB_URI: required("MONGODB_URI"),

  JWT_ACCESS_SECRET: required("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: required("JWT_REFRESH_SECRET"),
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",

  COOKIE_SECRET: required("COOKIE_SECRET"),
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || "localhost",

  BREVO_API_KEY: required("BREVO_API_KEY"),
  BREVO_SENDER_EMAIL: required("BREVO_SENDER_EMAIL"),
  BREVO_SENDER_NAME: process.env.BREVO_SENDER_NAME || "Airmark",

  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10),

  SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL || "",
  SUPER_ADMIN_NAME: process.env.SUPER_ADMIN_NAME || "Founder",

  OBS_BRIDGE_SECRET: required("OBS_BRIDGE_SECRET"),
};
