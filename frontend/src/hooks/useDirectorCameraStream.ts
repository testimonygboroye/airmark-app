import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socketClient";
import { createPeerConnection } from "@/lib/webrtc";

export type CameraConnectionStatus = "idle" | "connecting" | "connected" | "failed" | "reconnecting";

export function useDirectorCameraStream(eventId: string, teamId: string, operatorUserId: string | undefined) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraConnectionStatus>("idle");
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!operatorUserId) return;
    const socket = getSocket();
    let cancelled = false;

    function cleanupPeer() {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      pcRef.current?.close();
      pcRef.current = null;
    }

    async function connectTo(targetUserId: string) {
      if (pcRef.current || cancelled) return;
      setStatus("connecting");
      const pc = createPeerConnection("director-to-operator");

      pc.ontrack = (e) => {
        setStream(e.streams[0]);
        setStatus("connected");
      };

      pc.onconnectionstatechange = () => {
        if (cancelled) return;
        if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
          setStream(null);
          setStatus("reconnecting");
          cleanupPeer();
          // Weak/fluctuating networks (3G, poor signal) commonly drop and
          // recover — retry rather than giving up on the first failure.
          retryTimeoutRef.current = setTimeout(() => connectTo(targetUserId), 3000);
        }
      };

      pc.onicecandidate = (e) => {
        if (e.candidate) socket?.emit("webrtc:ice-candidate", { toUserId: targetUserId, eventId, candidate: e.candidate });
      };

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket?.emit("webrtc:offer", { toUserId: targetUserId, eventId, sdp: offer });
        pcRef.current = pc;
      } catch {
        setStatus("failed");
      }
    }

    function handleCameraReady(payload: { eventId: string; operatorUserId: string }) {
      if (payload.eventId === eventId && payload.operatorUserId === operatorUserId) connectTo(operatorUserId);
    }

    async function handleAnswer(payload: { fromUserId: string; eventId: string; sdp: RTCSessionDescriptionInit }) {
      if (payload.eventId !== eventId || payload.fromUserId !== operatorUserId || !pcRef.current) return;
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      } catch {
        setStatus("failed");
      }
    }

    function handleIceCandidate(payload: { fromUserId: string; eventId: string; candidate: RTCIceCandidateInit }) {
      if (payload.eventId !== eventId || payload.fromUserId !== operatorUserId) return;
      pcRef.current?.addIceCandidate(new RTCIceCandidate(payload.candidate)).catch(() => {});
    }

    function handleCameraStopped(payload: { eventId: string; operatorUserId: string }) {
      if (payload.eventId === eventId && payload.operatorUserId === operatorUserId) {
        cleanupPeer();
        setStream(null);
        setStatus("idle");
      }
    }

    socket?.on("webrtc:camera-ready", handleCameraReady);
    socket?.on("webrtc:answer", handleAnswer);
    socket?.on("webrtc:ice-candidate", handleIceCandidate);
    socket?.on("webrtc:camera-stopped", handleCameraStopped);

    socket?.emit("webrtc:request-cameras", { teamId, eventId });

    return () => {
      cancelled = true;
      socket?.off("webrtc:camera-ready", handleCameraReady);
      socket?.off("webrtc:answer", handleAnswer);
      socket?.off("webrtc:ice-candidate", handleIceCandidate);
      socket?.off("webrtc:camera-stopped", handleCameraStopped);
      cleanupPeer();
    };
  }, [eventId, teamId, operatorUserId]);

  return { stream, status };
}
