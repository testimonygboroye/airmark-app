import http from "http";
import { createApp } from "./app";
import { connectDatabase } from "./config/database";
import { initializeSocketServer, getSocketServer } from "./sockets";
import { initializeObsBridgeNamespace } from "./sockets/obsBridge.socket";
import { initializeDirectStreamBridgeNamespace } from "./sockets/directStreamBridge.socket";

const app = createApp();
const httpServer = http.createServer(app);

initializeSocketServer(httpServer);
initializeObsBridgeNamespace(getSocketServer());
initializeDirectStreamBridgeNamespace(getSocketServer());

void connectDatabase().catch((err) => {
  console.error("[vercel] MongoDB connection failed:", err);
});

export default httpServer;
