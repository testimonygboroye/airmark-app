export const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    // Open Relay Project — genuinely real, publicly documented free TURN
    // service (cited in Mozilla/Google's own WebRTC docs), replacing the
    // two earlier entries which were unverified and likely the actual
    // cause of connections stalling indefinitely.
    { urls: "turn:openrelay.metered.ca:80", username: "openrelayproject", credential: "openrelayproject" },
    { urls: "turn:openrelay.metered.ca:443", username: "openrelayproject", credential: "openrelayproject" },
    { urls: "turn:openrelay.metered.ca:443?transport=tcp", username: "openrelayproject", credential: "openrelayproject" },
  ],
  iceCandidatePoolSize: 4,
};

export function createPeerConnection(label: string): RTCPeerConnection {
  const pc = new RTCPeerConnection(ICE_SERVERS);
  pc.oniceconnectionstatechange = () => console.log(`[webrtc:${label}] ICE state:`, pc.iceConnectionState);
  pc.onconnectionstatechange = () => console.log(`[webrtc:${label}] connection state:`, pc.connectionState);
  pc.onicegatheringstatechange = () => console.log(`[webrtc:${label}] ICE gathering:`, pc.iceGatheringState);
  return pc;
}

export interface VideoQualityTier { width: number; height: number; frameRate: number; maxBitrate: number; }

const QUALITY_TIERS: Record<string, VideoQualityTier> = {
  high: { width: 640, height: 480, frameRate: 24, maxBitrate: 500_000 },
  medium: { width: 480, height: 360, frameRate: 15, maxBitrate: 250_000 },
  low: { width: 320, height: 240, frameRate: 12, maxBitrate: 150_000 },
  minimal: { width: 240, height: 180, frameRate: 10, maxBitrate: 80_000 },
};

export function getAdaptiveQualityTier(): VideoQualityTier {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  if (!connection) return QUALITY_TIERS.low;
  const effectiveType: string = connection.effectiveType || "3g";
  const downlink: number = connection.downlink || 1;
  if (effectiveType === "4g" && downlink >= 2) return QUALITY_TIERS.high;
  if (effectiveType === "4g" || (effectiveType === "3g" && downlink >= 1)) return QUALITY_TIERS.medium;
  if (effectiveType === "3g") return QUALITY_TIERS.low;
  return QUALITY_TIERS.minimal;
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
  } catch { /* not all browsers support this */ }
}

export function watchConnectionQuality(onChange: (tier: VideoQualityTier) => void): () => void {
  const connection = (navigator as any).connection;
  if (!connection || !connection.addEventListener) return () => {};
  const handler = () => onChange(getAdaptiveQualityTier());
  connection.addEventListener("change", handler);
  return () => connection.removeEventListener("change", handler);
}
