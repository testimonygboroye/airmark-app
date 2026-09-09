import type { RefObject } from "react";

interface Props {
  videoRef: RefObject<HTMLVideoElement | null>;
  hasCamera: boolean;
  cameraError: string | null;
  zoomSupported: boolean;
  zoomRange: { min: number; max: number; step: number };
  zoomValue: number;
  onZoomChange: (value: number) => void;
}

export function OperatorCameraPreview({ videoRef, hasCamera, cameraError, zoomSupported, zoomRange, zoomValue, onZoomChange }: Props) {
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex-1 min-h-0 relative bg-black">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        {!hasCamera && !cameraError && (
          <div className="absolute inset-0 flex items-center justify-center"><p className="text-xs text-white/60">Starting camera…</p></div>
        )}
        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center px-4"><p className="text-xs text-white/70 text-center">{cameraError}</p></div>
        )}
      </div>
      {zoomSupported && hasCamera && (
        <div className="shrink-0 px-4 py-2 bg-black/40">
          <input type="range" min={zoomRange.min} max={zoomRange.max} step={zoomRange.step} value={zoomValue} onChange={(e) => onZoomChange(parseFloat(e.target.value))} className="w-full" aria-label="Camera zoom" />
        </div>
      )}
    </div>
  );
}
