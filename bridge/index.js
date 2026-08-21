const OBSWebSocket = require("obs-websocket-js").default;
const { io } = require("socket.io-client");
const readlineSync = require("readline-sync");
require("dotenv").config();

const OBS_ADDRESS = process.env.OBS_ADDRESS || "ws://127.0.0.1:4455";
const OBS_PASSWORD = process.env.OBS_PASSWORD || undefined;
const BACKEND_URL = process.env.AIRMARK_BACKEND_URL || "https://airmark-backend.onrender.com";

console.log("=== Airmark OBS Bridge ===");
console.log("This connects your OBS Studio to Airmark's director controls.");
console.log("Keep this window open for as long as you want remote control active.\n");

const pairingToken =
  process.env.AIRMARK_PAIRING_TOKEN ||
  readlineSync.question("Paste the pairing token from Airmark (Director > Go Live > Connect OBS): ");

const obs = new OBSWebSocket();
const bridgeSocket = io(`${BACKEND_URL}/obs-bridge`, {
  auth: { token: pairingToken },
  reconnection: true,
  reconnectionAttempts: Infinity,
});

async function connectToObs() {
  try {
    const { obsWebSocketVersion } = await obs.connect(OBS_ADDRESS, OBS_PASSWORD);
    console.log(`✓ Connected to OBS Studio (obs-websocket v${obsWebSocketVersion})`);

    const { scenes, currentProgramSceneName } = await obs.call("GetSceneList");
    const sceneList = scenes
      .map((s) => ({ sceneName: s.sceneName, sceneIndex: s.sceneIndex }))
      .reverse();

    bridgeSocket.emit("obs:hello", {
      obsVersion: obsWebSocketVersion,
      scenes: sceneList,
      currentProgramScene: currentProgramSceneName,
    });

    obs.on("CurrentProgramSceneChanged", ({ sceneName }) => {
      bridgeSocket.emit("obs:scene-changed", { currentProgramScene: sceneName });
    });

    obs.on("ConnectionClosed", () => {
      console.log("✗ Lost connection to OBS Studio. Retrying in 5s...");
      setTimeout(connectToObs, 5000);
    });
  } catch (err) {
    console.error("✗ Could not connect to OBS:", err.message);
    console.log("  Make sure OBS Studio is running and its WebSocket server is enabled");
    console.log("  (Tools > WebSocket Server Settings > Enable WebSocket server).");
    console.log("  Retrying in 5s...");
    setTimeout(connectToObs, 5000);
  }
}

bridgeSocket.on("connect", () => {
  console.log("✓ Connected to Airmark backend");
});

bridgeSocket.on("connect_error", (err) => {
  console.error("✗ Could not connect to Airmark backend:", err.message);
});

bridgeSocket.on("obs:command", async ({ requestId, requestType, requestData }) => {
  try {
    const data = await obs.call(requestType, requestData);
    bridgeSocket.emit("obs:command:result", { requestId, success: true, data });
  } catch (err) {
    bridgeSocket.emit("obs:command:result", {
      requestId,
      success: false,
      error: err.message || "Unknown OBS error",
    });
  }
});

bridgeSocket.on("disconnect", () => {
  console.log("✗ Disconnected from Airmark backend. Reconnecting...");
});

connectToObs();
