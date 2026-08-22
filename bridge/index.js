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

let healthInterval = null;

async function fetchSceneItems(sceneName) {
  try {
    const { sceneItems } = await obs.call("GetSceneItemList", { sceneName });
    return sceneItems.map((item) => ({
      sceneItemId: item.sceneItemId,
      sourceName: item.sourceName,
      sceneItemEnabled: item.sceneItemEnabled,
    }));
  } catch {
    return [];
  }
}

async function pollHealth() {
  try {
    const streamStatus = await obs.call("GetStreamStatus");
    const recordStatus = await obs.call("GetRecordStatus");
    bridgeSocket.emit("obs:health-update", {
      streaming: {
        active: streamStatus.outputActive,
        outputSkippedFrames: streamStatus.outputSkippedFrames,
        outputTotalFrames: streamStatus.outputTotalFrames,
      },
      recording: { active: recordStatus.outputActive },
    });
  } catch {
    /* OBS may be briefly unreachable — next poll will retry */
  }
}

async function connectToObs() {
  try {
    const { obsWebSocketVersion } = await obs.connect(OBS_ADDRESS, OBS_PASSWORD);
    console.log(`✓ Connected to OBS Studio (obs-websocket v${obsWebSocketVersion})`);

    const { scenes, currentProgramSceneName } = await obs.call("GetSceneList");
    const sceneList = scenes
      .map((s) => ({ sceneName: s.sceneName, sceneIndex: s.sceneIndex }))
      .reverse();

    const { transitions, currentSceneTransitionName } = await obs.call("GetSceneTransitionList");
    let transitionDurationMs = 300;
    try {
      const t = await obs.call("GetCurrentSceneTransition");
      transitionDurationMs = t.transitionDuration ?? 300;
    } catch {
      /* some transitions (e.g. Cut) have no duration */
    }

    const sceneItems = await fetchSceneItems(currentProgramSceneName);

    bridgeSocket.emit("obs:hello", {
      obsVersion: obsWebSocketVersion,
      scenes: sceneList,
      currentProgramScene: currentProgramSceneName,
      transitions: transitions.map((t) => t.transitionName),
      currentTransition: currentSceneTransitionName,
      transitionDurationMs,
      sceneItems,
    });

    if (healthInterval) clearInterval(healthInterval);
    healthInterval = setInterval(pollHealth, 5000);
    pollHealth();

    obs.on("CurrentProgramSceneChanged", async ({ sceneName }) => {
      bridgeSocket.emit("obs:scene-changed", { currentProgramScene: sceneName });
      const items = await fetchSceneItems(sceneName);
      bridgeSocket.emit("obs:scene-items-update", { sceneName, items });
    });

    obs.on("CurrentSceneTransitionChanged", ({ transitionName }) => {
      bridgeSocket.emit("obs:transition-changed", { transitionName });
    });

    obs.on("SceneItemEnableStateChanged", ({ sceneItemId, sceneItemEnabled }) => {
      bridgeSocket.emit("obs:scene-item-toggled", { sceneItemId, sceneItemEnabled });
    });

    obs.on("StreamStateChanged", () => pollHealth());
    obs.on("RecordStateChanged", () => pollHealth());

    obs.on("ConnectionClosed", () => {
      console.log("✗ Lost connection to OBS Studio. Retrying in 5s...");
      if (healthInterval) clearInterval(healthInterval);
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
