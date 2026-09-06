export const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    // First free TURN provider (ExpressTURN) — a relay used when a
    // direct phone-to-phone connection can't be established.
    {
      urls: "turn:relay1.expressturn.com:3478",
      username: "efQZ4LFJ8FVVYNXGF5",
      credential: "154788349gGHUJVA",
    },
    // Second independent free TURN provider — redundancy in case the
    // first is ever unreachable; the browser tries every configured
    // server and uses whichever succeeds.
    {
      urls: "turn:freestun.net:3478",
      username: "free",
      credential: "free",
    },
  ],
  iceCandidatePoolSize: 4,
};

export function createPeerConnection(): RTCPeerConnection {
  return new RTCPeerConnection(ICE_SERVERS);
}

export interface VideoQualityTier {
  width: number;
  height: number;
  frameRate: number;
  maxBitrate: number;
}

const QUALITY_TIERS: Record<string, VideoQualityTier> = {
  high: { width: 640, height: 480, frameRate: 24, maxBitrate: 500_000 },
  medium: { width: 480, height: 360, frameRate: 15, maxBitrate: 250_000 },
  low: { width: 320, height: 240, frameRate: 12, maxBitrate: 150_000 },
  minimal: { width: 240, height: 180, frameRate: 10, maxBitrate: 80_000 },
};

/**
 * Reads the browser's Network Information API (supported on Chrome/
 * Android, which covers the primary target platform) to pick a quality
 * tier matching the actual current connection — scaling UP on a strong
 * connection just as much as scaling DOWN on a weak one. Falls back to
 * "low" (not "high") when the API is unavailable, since that's the safer
 * default for an unknown connection.
 */
export function getAdaptiveQualityTier(): VideoQualityTier {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  if (!connection) return QUALITY_TIERS.low;

  const effectiveType: string = connection.effectiveType || "3g";
  const downlink: number = connection.downlink || 1;

  if (effectiveType === "4g" && downlink >= 2) return QUALITY_TIERS.high;
  if (effectiveType === "4g" || (effectiveType === "3g" && downlink >= 1)) return QUALITY_TIERS.medium;
  if (effectiveType === "3g") return QUALITY_TIERS.low;
  return QUALITY_TIERS.minimal; // 2g / slow-2g
}

export function tierToConstraints(tier: VideoQualityTier): MediaTrackConstraints {
  return {
    facingMode: "environment",
    width: { ideal: tier.width, max: tier.width * 1.5 },
    height: { ideal: tier.height, max: tier.height * 1.5 },
    frameRate: { ideal: tier.frameRate, max: tier.frameRate + 5 },
  };
}

export async function applyBitrateCap(sender: RTCRtpSender, maxBitrate: number): Promise<void> {
  try {
    const params = sender.getParameters();
    if (!params.encodings) params.encodings = [{}];
    params.encodings[0].maxBitrate = maxBitrate;
    await sender.setParameters(params);
  } catch {
    /* not all browsers support this — safe to ignore */
  }
}

/** Listens for real-time connection quality changes and reports the new
 * tier — used to upgrade quality automatically if a weak connection
 * improves, or downgrade if it worsens, without restarting the stream. */
export function watchConnectionQuality(onChange: (tier: VideoQualityTier) => void): () => void {
  const connection = (navigator as any).connection;
  if (!connection || !connection.addEventListener) return () => {};

  const handler = () => onChange(getAdaptiveQualityTier());
  connection.addEventListener("change", handler);
  return () => connection.removeEventListener("change", handler);
}
