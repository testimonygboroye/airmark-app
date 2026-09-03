import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socketClient";
import { createPeerConnection } from "@/lib/webrtc";

export function useDirectorCameraStream(
  eventId: string,
  teamId: string,
  operatorUserId: string | undefined
) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    if (!operatorUserId) return;
    const socket = getSocket();

    async function connectTo(targetUserId: string) {
      if (pcRef.current) return;
      const pc = createPeerConnection();
      pc.ontrack = (e) => setStream(e.streams[0]);
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket?.emit("webrtc:ice-candidate", { toUserId: targetUserId, eventId, candidate: e.candidate });
        }
      };
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket?.emit("webrtc:offer", { toUserId: targetUserId, eventId, sdp: offer });
      pcRef.current = pc;
    }

    function handleCameraReady(payload: { eventId: string; operatorUserId: string }) {
      if (payload.eventId === eventId && payload.operatorUserId === operatorUserId) {
        connectTo(operatorUserId);
      }
    }

    async function handleAnswer(payload: { fromUserId: string; eventId: string; sdp: RTCSessionDescriptionInit }) {
      if (payload.eventId !== eventId || payload.fromUserId !== operatorUserId || !pcRef.current) return;
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
    }

    function handleIceCandidate(payload: { fromUserId: string; eventId: string; candidate: RTCIceCandidateInit }) {
      if (payload.eventId !== eventId || payload.fromUserId !== operatorUserId) return;
      pcRef.current?.addIceCandidate(new RTCIceCandidate(payload.candidate)).catch(() => {});
    }

    function handleCameraStopped(payload: { eventId: string; operatorUserId: string }) {
      if (payload.eventId === eventId && payload.operatorUserId === operatorUserId) {
        pcRef.current?.close();
        pcRef.current = null;
        setStream(null);
      }
    }

    socket?.on("webrtc:camera-ready", handleCameraReady);
    socket?.on("webrtc:answer", handleAnswer);
    socket?.on("webrtc:ice-candidate", handleIceCandidate);
    socket?.on("webrtc:camera-stopped", handleCameraStopped);

    // Ask any already-broadcasting operator (opened before we did) to re-announce.
    socket?.emit("webrtc:request-cameras", { teamId, eventId });

    return () => {
      socket?.off("webrtc:camera-ready", handleCameraReady);
      socket?.off("webrtc:answer", handleAnswer);
      socket?.off("webrtc:ice-candidate", handleIceCandidate);
      socket?.off("webrtc:camera-stopped", handleCameraStopped);
      pcRef.current?.close();
      pcRef.current = null;
    };
  }, [eventId, teamId, operatorUserId]);

  return stream;
}
