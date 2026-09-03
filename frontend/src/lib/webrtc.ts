export const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export function createPeerConnection(): RTCPeerConnection {
  return new RTCPeerConnection(ICE_SERVERS);
}
