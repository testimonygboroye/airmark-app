import { useEffect, useRef, useState } from "react";

interface Props {
  stream: MediaStream | null;
  statusLabel: string;
}

/**
 * Shared full-screen video experience for anyone watching a live camera
 * feed with sound: swipe the right half up/down for volume, left half
 * for a visual brightness effect (a CSS filter — browsers cannot control
 * a device's actual screen backlight, so this is the same practical
 * approximation most video apps use, not real hardware brightness).
 */
export function LiveVideoPlayer({ stream, statusLabel }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [volume, setVolume] = useState(1);
  const [brightness, setBrightness] = useState(1);
  const [needsTapToPlay, setNeedsTapToPlay] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number; side: "left" | "right"; startValue: number } | null>(null);
  const [gestureHint, setGestureHint] = useState<string | null>(null);

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
        try {
          await (screen.orientation as any)?.lock?.("landscape");
        } catch { /* orientation lock isn't supported on every browser — fullscreen still works without it */ }
      } else {
        await document.exitFullscreen();
      }
    } catch { /* fullscreen request can be blocked by the browser — no action needed */ }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ filter: `brightness(${brightness})` }}
        className="w-full h-full object-contain"
      />

      {!stream && (
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <p className="text-sm text-white/60 text-center">{statusLabel}</p>
        </div>
      )}

      {needsTapToPlay && stream && (
        <button onClick={handleTapToPlay} className="absolute inset-0 flex items-center justify-center bg-black/50">
          <span className="px-5 py-3 rounded-full bg-white text-navy text-sm font-semibold">Tap to play with sound</span>
        </button>
      )}

      {gestureHint && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2 rounded-lg bg-black/70 text-white text-sm font-medium">
          {gestureHint}
        </div>
      )}

      <button onClick={toggleFullscreenLandscape} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center" aria-label="Toggle fullscreen">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-white/40">
        Swipe right side for volume · left side for brightness
      </p>
    </div>
  );
}
