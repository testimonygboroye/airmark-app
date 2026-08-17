import mongoose from "mongoose";
import { env } from "./env";

let isConnected = false;

export async function connectDatabase(): Promise<void> {
  if (isConnected) return;

  mongoose.set("strictQuery", true);

  mongoose.connection.on("connected", () => {
    isConnected = true;
    console.log("[database] MongoDB connected");
  });

  mongoose.connection.on("disconnected", () => {
    isConnected = false;
    console.warn("[database] MongoDB disconnected — attempting reconnect");
  });

  mongoose.connection.on("error", (err) => {
    console.error("[database] MongoDB connection error:", err.message);
  });

  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 10,
  });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  isConnected = false;
}
