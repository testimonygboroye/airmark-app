const { io } = require("socket.io-client");
const { spawn } = require("child_process");
const readlineSync = require("readline-sync");
require("dotenv").config();

const BACKEND_URL = process.env.AIRMARK_BACKEND_URL || "https://airmark-backend.onrender.com";

console.log("=== Airmark Direct Stream Bridge ===");
console.log("Sends a single camera feed to any RTMP destination (YouTube, Facebook, Twitch,");
console.log("a Telegram group's RTMP endpoint, or any other RTMP-compatible service).");
console.log("Requires ffmpeg to be installed on this computer (https://ffmpeg.org/download.html).\n");

const pairingToken =
  process.env.AIRMARK_PAIRING_TOKEN ||
  readlineSync.question("Paste the pairing token from Airmark (Director > Go Live > Direct Stream > Connect): ");

const videoDevice =
  process.env.AIRMARK_VIDEO_DEVICE ||
  readlineSync.question(
    'Video device to capture (Windows example: "video=Integrated Camera", Linux example: "/dev/video0"): '
  );

const socket = io(`${BACKEND_URL}/direct-stream-bridge`, {
  auth: { token: pairingToken },
  reconnection: true,
  reconnectionAttempts: Infinity,
});

let ffmpegProcess = null;

function startFfmpeg(rtmpUrl, streamKey) {
  if (ffmpegProcess) {
    console.log("Already streaming — stop first before starting again.");
    return;
  }

  const fullUrl = `${rtmpUrl.replace(/\/$/, "")}/${streamKey}`;
  const isWindows = process.platform === "win32";
  const inputFormat = isWindows ? "dshow" : process.platform === "darwin" ? "avfoundation" : "v4l2";

  console.log(`Starting stream to ${rtmpUrl} ...`);

  ffmpegProcess = spawn("ffmpeg", [
    "-f", inputFormat,
    "-i", videoDevice,
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-b:v", "2500k",
    "-maxrate", "2500k",
    "-bufsize", "5000k",
    "-pix_fmt", "yuv420p",
    "-g", "60",
    "-f", "flv",
    fullUrl,
  ]);

  ffmpegProcess.stderr.on("data", (data) => {
    // ffmpeg logs progress to stderr by design — not an error unless it exits non-zero.
  });

  ffmpegProcess.on("spawn", () => {
    console.log("✓ Streaming started");
    socket.emit("directstream:streaming");
  });

  ffmpegProcess.on("error", (err) => {
    console.error("✗ ffmpeg error:", err.message);
    console.log("  Make sure ffmpeg is installed and on your system PATH.");
    socket.emit("directstream:error", { message: err.message });
    ffmpegProcess = null;
  });

  ffmpegProcess.on("exit", (code) => {
    console.log(`Stream process exited (code ${code})`);
    ffmpegProcess = null;
    socket.emit("directstream:stopped");
  });
}

function stopFfmpeg() {
  if (!ffmpegProcess) return;
  ffmpegProcess.kill("SIGINT");
  ffmpegProcess = null;
  console.log("✓ Stream stopped");
}

socket.on("connect", () => console.log("✓ Connected to Airmark backend"));
socket.on("connect_error", (err) => console.error("✗ Could not connect:", err.message));
socket.on("directstream:start", ({ rtmpUrl, streamKey }) => startFfmpeg(rtmpUrl, streamKey));
socket.on("directstream:stop", () => stopFfmpeg());
socket.on("disconnect", () => console.log("✗ Disconnected from Airmark backend. Reconnecting..."));

process.on("SIGINT", () => {
  stopFfmpeg();
  process.exit(0);
});
