import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socketClient";
import { createPeerConnection, getAdaptiveQualityTier, tierToConstraints, applyBitrateCap, watchConnectionQuality } from "@/lib/webrtc";

export function useOperatorCamera(eventId: string, teamId: string, active: boolean) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const sendersRef = useRef<RTCRtpSender[]>([]);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [zoomSupported, setZoomSupported] = useState(false);
  const [zoomRange, setZoomRange] = useState<{ min: number; max: number; step: number }>({ min: 1, max: 1, step: 0.1 });

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    async function applyQuality(track: MediaStreamTrack) {
      const tier = getAdaptiveQualityTier();
      try {
        await track.applyConstraints(tierToConstraints(tier));
      } catch { /* device may not support requested resolution exactly — browser picks closest */ }
      await Promise.all(sendersRef.current.map((s) => applyBitrateCap(s, tier.maxBitrate)));
    }

    async function start() {
      try {
        const initialTier = getAdaptiveQualityTier();
        const stream = await navigator.mediaDevices.getUserMedia({ video: tierToConstraints(initialTier), audio: false });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const track = stream.getVideoTracks()[0];
        trackRef.current = track;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        setHasCamera(true);

        const capabilities = (track.getCapabilities?.() as any) || {};
        if (capabilities.zoom) {
          setZoomSupported(true);
          setZoomRange({ min: capabilities.zoom.min, max: capabilities.zoom.max, step: capabilities.zoom.step || 0.1 });
        }

        getSocket()?.emit("webrtc:camera-ready", { eventId, teamId });
      } catch (err: any) {
        setCameraError(err?.name === "NotAllowedError" ? "Camera access denied — allow camera permission to show your preview." : "Couldn't access your camera on this device.");
      }
    }
    start();

    // Re-check quality as the real connection changes — upgrades
    // automatically on a stronger signal, downgrades on a weaker one,
    // without restarting the camera or dropping the call.
    const stopWatching = watchConnectionQuality(() => {
      if (trackRef.current) applyQuality(trackRef.current);
    });

    const socket = getSocket();

    async function handleOffer(payload: { fromUserId: string; sdp: RTCSessionDescriptionInit; eventId: string }) {
      if (payload.eventId !== eventId || !streamRef.current) return;
      peersRef.current.get(payload.fromUserId)?.close();

      const pc = createPeerConnection();
      const tier = getAdaptiveQualityTier();
      streamRef.current.getTracks().forEach((track) => {
        const sender = pc.addTrack(track, streamRef.current!);
        sendersRef.current.push(sender);
        applyBitrateCap(sender, tier.maxBitrate);
      });
      pc.onicecandidate = (e) => {
        if (e.candidate) socket?.emit("webrtc:ice-candidate", { toUserId: payload.fromUserId, eventId, candidate: e.candidate });
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
          peersRef.current.delete(payload.fromUserId);
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
      peersRef.current.get(payload.fromUserId)?.addIceCandidate(new RTCIceCandidate(payload.candidate)).catch(() => {});
    }

    function handleRequestCameras(payload: { teamId: string }) {
      if (payload.teamId === teamId && streamRef.current) socket?.emit("webrtc:camera-ready", { eventId, teamId });
    }

    socket?.on("webrtc:offer", handleOffer);
    socket?.on("webrtc:ice-candidate", handleIceCandidate);
    socket?.on("webrtc:request-cameras", handleRequestCameras);

    const heartbeat = setInterval(() => {
      if (streamRef.current) socket?.emit("webrtc:camera-ready", { eventId, teamId });
    }, 8000);

    return () => {
      cancelled = true;
      clearInterval(heartbeat);
      stopWatching();
      socket?.off("webrtc:offer", handleOffer);
      socket?.off("webrtc:ice-candidate", handleIceCandidate);
      socket?.off("webrtc:request-cameras", handleRequestCameras);
      socket?.emit("webrtc:camera-stopped", { eventId, teamId });
      peersRef.current.forEach((pc) => pc.close());
      peersRef.current.clear();
      sendersRef.current = [];
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [eventId, teamId, active]);

  async function setZoom(value: number) {
    if (!trackRef.current) return;
    try {
      await trackRef.current.applyConstraints({ advanced: [{ zoom: value } as any] });
    } catch { /* device doesn't honor it despite reporting support */ }
  }

  return { localVideoRef, cameraError, hasCamera, zoomSupported, zoomRange, setZoom };
}
