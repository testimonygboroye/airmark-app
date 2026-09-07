import { useOperatorCamera } from "@/hooks/useOperatorCamera";

interface Props {
  eventId: string;
  teamId: string;
}

export function OperatorCameraPreview({ eventId, teamId }: Props) {
  const { localVideoRef, cameraError, hasCamera, torchSupported, torchOn, toggleTorch } = useOperatorCamera(eventId, teamId, true);

  return (
    <div className="flex-1 min-h-0 relative bg-black">
      <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
      {!hasCamera && !cameraError && (
        <div className="absolute inset-0 flex items-center justify-center"><p className="text-xs text-white/60">Starting camera…</p></div>
      )}
      {cameraError && (
        <div className="absolute inset-0 flex items-center justify-center px-4"><p className="text-xs text-white/70 text-center">{cameraError}</p></div>
      )}
      {torchSupported && hasCamera && (
        <button
          onClick={toggleTorch}
          aria-label="Toggle flashlight"
          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center ${torchOn ? "bg-accent-teal text-navy" : "bg-black/50 text-white"}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9 2h6l-1 6h2l-7 12 1-8H8l1-10z" fill="currentColor" />
          </svg>
        </button>
      )}
    </div>
  );
}
