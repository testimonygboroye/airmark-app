export const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:relay1.expressturn.com:3478",
      username: "efQZ4LFJ8FVVYNXGF5",
      credential: "154788349gGHUJVA",
    },
    // Second independent free TURN provider — redundancy in case the
    // first is ever unreachable or rate-limited; the browser tries every
    // configured server and uses whichever succeeds.
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

/**
 * Deliberately low resolution/framerate — this is the single biggest
 * factor in whether a video connection can establish and hold on a weak
 * 3G/rural connection at all. A smaller, choppier picture that actually
 * connects is far better than a crisp one that never does.
 */
export const LOW_BANDWIDTH_VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  facingMode: "environment",
  width: { ideal: 320, max: 480 },
  height: { ideal: 240, max: 360 },
  frameRate: { ideal: 12, max: 15 },
};

/** Caps outgoing bitrate explicitly — realistic for sustained 3G. */
export async function applyLowBandwidthEncoding(sender: RTCRtpSender): Promise<void> {
  try {
    const params = sender.getParameters();
    if (!params.encodings) params.encodings = [{}];
    params.encodings[0].maxBitrate = 150_000; // 150 kbps
    await sender.setParameters(params);
  } catch {
    /* not all browsers support this — safe to ignore */
  }
}
