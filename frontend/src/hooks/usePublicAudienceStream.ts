import { useEffect, useRef, useState } from "react";
import { connectPublicSocket, disconnectPublicSocket } from "@/lib/publicSocketClient";
import { createPeerConnection } from "@/lib/webrtc";

export function usePublicAudienceStream(publicShareToken: string, teamId: string, operatorUserId: string | undefined) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "reconnecting">("idle");
  const pcRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    if (!publicShareToken || !operatorUserId) return;
    const socket = connectPublicSocket(publicShareToken);
    let cancelled = false;

    function cleanup() {
      pcRef.current?.close();
      pcRef.current = null;
    }

    async function connectTo(targetUserId: string) {
      if (pcRef.current || cancelled) return;
      setStatus("connecting");
      const pc = createPeerConnection();
      pc.ontrack = (e) => { setStream(e.streams[0]); setStatus("connected"); };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
          setStream(null);
          setStatus("reconnecting");
          cleanup();
          setTimeout(() => connectTo(targetUserId), 3000);
        }
      };
      pc.onicecandidate = (e) => { if (e.candidate) socket.emit("webrtc:ice-candidate", { toUserId: targetUserId, candidate: e.candidate }); };
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("webrtc:offer", { toUserId: targetUserId, sdp: offer });
      pcRef.current = pc;
    }

    function handleCameraReady(payload: { operatorUserId: string }) {
      if (payload.operatorUserId === operatorUserId) connectTo(operatorUserId);
    }
    async function handleAnswer(payload: { fromUserId: string; sdp: RTCSessionDescriptionInit }) {
      if (payload.fromUserId !== operatorUserId || !pcRef.current) return;
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
    }
    function handleIceCandidate(payload: { fromUserId: string; candidate: RTCIceCandidateInit }) {
      if (payload.fromUserId !== operatorUserId) return;
      pcRef.current?.addIceCandidate(new RTCIceCandidate(payload.candidate)).catch(() => {});
    }

    socket.on("webrtc:camera-ready", handleCameraReady);
    socket.on("webrtc:answer", handleAnswer);
    socket.on("webrtc:ice-candidate", handleIceCandidate);
    socket.emit("webrtc:request-cameras", { teamId });

    return () => {
      cancelled = true;
      socket.off("webrtc:camera-ready", handleCameraReady);
      socket.off("webrtc:answer", handleAnswer);
      socket.off("webrtc:ice-candidate", handleIceCandidate);
      cleanup();
      disconnectPublicSocket();
    };
  }, [publicShareToken, teamId, operatorUserId]);

  return { stream, status };
}
