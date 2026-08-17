import http from "http";
import { env } from "./config/env";
import { createApp } from "./app";
import { connectDatabase } from "./config/database";
import { initializeSocketServer } from "./sockets";

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const app = createApp();
  const httpServer = http.createServer(app);

  initializeSocketServer(httpServer);

  httpServer.listen(env.PORT, () => {
    console.log(`[server] Airmark backend running on port ${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = async (signal: string) => {
    console.log(`[server] Received ${signal}, shutting down gracefully...`);
    httpServer.close(() => {
      console.log("[server] HTTP server closed");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

bootstrap().catch((err) => {
  console.error("[server] Failed to start:", err);
  process.exit(1);
});
