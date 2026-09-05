import { useEffect, useState } from "react";
import { useOperatorCamera } from "@/hooks/useOperatorCamera";
import { apiClient } from "@/lib/apiClient";

interface Props {
  eventId: string;
  teamId: string;
}

export function OperatorCameraPreview({ eventId, teamId }: Props) {
  const { localVideoRef, cameraError, hasCamera, zoomSupported, zoomRange, setZoom } = useOperatorCamera(eventId, teamId, true);
  const [zoomValue, setZoomValue] = useState(1);
  const [maxZoomPref, setMaxZoomPref] = useState<number | null>(null);

  useEffect(() => {
    apiClient.get("/auth/me").then((res) => setMaxZoomPref(res.data.data.maxZoomPreference ?? 10)).catch(() => setMaxZoomPref(10));
  }, []);

  const effectiveMax = maxZoomPref !== null ? Math.min(zoomRange.max, maxZoomPref) : zoomRange.max;

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex-1 min-h-0 relative bg-black">
        <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        {!hasCamera && !cameraError && (
          <div className="absolute inset-0 flex items-center justify-center"><p className="text-xs text-white/60">Starting camera…</p></div>
        )}
        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center px-4"><p className="text-xs text-white/70 text-center">{cameraError}</p></div>
        )}
      </div>
      {zoomSupported && hasCamera && (
        <div className="px-4 py-2 bg-black/40">
          <input
            type="range"
            min={zoomRange.min}
            max={effectiveMax}
            step={zoomRange.step}
            value={Math.min(zoomValue, effectiveMax)}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setZoomValue(v);
              setZoom(v);
            }}
            className="w-full"
            aria-label="Camera zoom"
          />
        </div>
      )}
    </div>
  );
}
