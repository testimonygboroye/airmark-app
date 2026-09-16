import { useEffect, useRef, useState } from "react";

type ConnectionPhase = "loading" | "no_live_camera" | "connecting" | "reconnecting" | "playing" | "error";

interface Props {
  stream: MediaStream | null;
  phase: ConnectionPhase;
}

/**
 * Full-screen live player: swipe right half for volume, left half for a
 * visual brightness filter (browsers cannot control real screen
 * backlight — this is the same practical approximation every web video
 * player uses), double-tap center to play/pause. touch-action: none
 * plus overscroll-behavior stop the page itself from scrolling while a
 * gesture is in progress, which was the root cause of the scrolling bug.
 */
export function LiveVideoPlayer({ stream, phase }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [volume, setVolume] = useState(1);
  const [brightness, setBrightness] = useState(1);
  const [needsTapToPlay, setNeedsTapToPlay] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number; side: "left" | "right"; startValue: number } | null>(null);
  const [gestureHint, setGestureHint] = useState<string | null>(null);
  const lastTapRef = useRef<number>(0);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  useEffect(() => {
    if (!stream || !videoRef.current) return;
    videoRef.current.play().catch(() => setNeedsTapToPlay(true));
  }, [stream]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = volume;
  }, [volume]);

  function handleTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0];
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const side = touch.clientX < rect.left + rect.width / 2 ? "left" : "right";
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, side, startValue: side === "left" ? brightness : volume };
  }

  function handleTouchMove(e: React.TouchEvent) {
    e.preventDefault();
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const deltaY = touchStartRef.current.y - touch.clientY;
    const change = deltaY / 300;

    if (touchStartRef.current.side === "left") {
      const next = Math.min(1.5, Math.max(0.3, touchStartRef.current.startValue + change));
      setBrightness(next);
      setGestureHint(`Brightness ${Math.round((next / 1.5) * 100)}%`);
    } else {
      const next = Math.min(1, Math.max(0, touchStartRef.current.startValue + change));
      setVolume(next);
      setGestureHint(`Volume ${Math.round(next * 100)}%`);
    }
  }

  function handleTouchEnd() {
    touchStartRef.current = null;
    setTimeout(() => setGestureHint(null), 800);
  }

  function togglePlayPause() {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPaused(false);
    } else {
      videoRef.current.pause();
      setIsPaused(true);
    }
  }

  function handleContainerClick() {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      togglePlayPause();
    }
    lastTapRef.current = now;
  }

  async function handleTapToPlay() {
    try {
      await videoRef.current?.play();
      setNeedsTapToPlay(false);
    } catch { /* still blocked — user needs to try again */ }
  }

  async function toggleFullscreenLandscape() {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        try { await (screen.orientation as any)?.lock?.("landscape"); } catch { /* not supported everywhere */ }
      } else {
        await document.exitFullscreen();
      }
    } catch { /* fullscreen can be blocked by the browser */ }
  }

  const statusMessages: Record<ConnectionPhase, string> = {
    loading: "Loading…",
    no_live_camera: "No camera is currently live",
    connecting: "Connecting to the live feed…",
    reconnecting: "Connection lost — reconnecting…",
    playing: "",
    error: "Couldn't reach this stream. Please check your connection.",
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black overflow-hidden select-none touch-none"
      style={{ overscrollBehavior: "none" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleContainerClick}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ filter: `brightness(${brightness})` }}
        className="w-full h-full object-contain"
      />

      {phase !== "playing" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 bg-navy/95">
          <div className="w-14 h-14 rounded-full bg-signal-red/20 flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 4l4 8-4 8M20 4l-4 8 4 8" stroke="#E4293B" strokeWidth="2" strokeLinecap="round" /></svg>
          </div>
          <p className="text-sm text-white/70 text-center">{statusMessages[phase]}</p>
        </div>
      )}

      {isPaused && phase === "playing" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
        </div>
      )}

      {needsTapToPlay && stream && (
        <button onClick={(e) => { e.stopPropagation(); handleTapToPlay(); }} className="absolute inset-0 flex items-center justify-center bg-black/50">
          <span className="px-5 py-3 rounded-full bg-white text-navy text-sm font-semibold">Tap to play with sound</span>
        </button>
      )}

      {gestureHint && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2 rounded-lg bg-black/70 text-white text-sm font-medium pointer-events-none">
          {gestureHint}
        </div>
      )}

      <button onClick={(e) => { e.stopPropagation(); toggleFullscreenLandscape(); }} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>

      <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-white/40 pointer-events-none">
        Swipe right for volume · left for brightness · double-tap to play/pause
      </p>
    </div>
  );
}
