import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socketClient";
import { createPeerConnection } from "@/lib/webrtc";

export function useOperatorCamera(eventId: string, teamId: string, active: boolean) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState(false);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        setHasCamera(true);

        const socket = getSocket();
        socket?.emit("webrtc:camera-ready", { eventId, teamId });
      } catch (err: any) {
        setCameraError(
          err?.name === "NotAllowedError"
            ? "Camera access denied — allow camera permission to show your preview."
            : "Couldn't access your camera on this device."
        );
      }
    }
    start();

    const socket = getSocket();

    async function handleOffer(payload: { fromUserId: string; sdp: RTCSessionDescriptionInit; eventId: string }) {
      if (payload.eventId !== eventId || !streamRef.current) return;
      const pc = createPeerConnection();
      streamRef.current.getTracks().forEach((track) => pc.addTrack(track, streamRef.current!));
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket?.emit("webrtc:ice-candidate", { toUserId: payload.fromUserId, eventId, candidate: e.candidate });
        }
      };
      await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket?.emit("webrtc:answer", { toUserId: payload.fromUserId, eventId, sdp: answer });
      peersRef.current.set(payload.fromUserId, pc);
    }

    function handleIceCandidate(payload: { fromUserId: string; eventId: string; candidate: RTCIceCandidateInit }) {
      if (payload.eventId !== eventId) return;
      const pc = peersRef.current.get(payload.fromUserId);
      pc?.addIceCandidate(new RTCIceCandidate(payload.candidate)).catch(() => {});
    }

    function handleRequestCameras(payload: { teamId: string }) {
      if (payload.teamId === teamId && streamRef.current) {
        socket?.emit("webrtc:camera-ready", { eventId, teamId });
      }
    }

    socket?.on("webrtc:offer", handleOffer);
    socket?.on("webrtc:ice-candidate", handleIceCandidate);
    socket?.on("webrtc:request-cameras", handleRequestCameras);

    return () => {
      cancelled = true;
      socket?.off("webrtc:offer", handleOffer);
      socket?.off("webrtc:ice-candidate", handleIceCandidate);
      socket?.off("webrtc:request-cameras", handleRequestCameras);
      socket?.emit("webrtc:camera-stopped", { eventId, teamId });
      peersRef.current.forEach((pc) => pc.close());
      peersRef.current.clear();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [eventId, teamId, active]);

  return { localVideoRef, cameraError, hasCamera };
}
