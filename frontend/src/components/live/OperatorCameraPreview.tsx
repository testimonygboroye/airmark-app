import { useOperatorCamera } from "@/hooks/useOperatorCamera";

interface Props {
  eventId: string;
  teamId: string;
}

export function OperatorCameraPreview({ eventId, teamId }: Props) {
  const { localVideoRef, cameraError, hasCamera } = useOperatorCamera(eventId, teamId, true);

  return (
    <div className="w-full max-w-xs aspect-[4/3] rounded-2xl overflow-hidden bg-black/30 border border-white/15 relative">
      <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
      {!hasCamera && !cameraError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-xs text-white/60">Starting camera…</p>
        </div>
      )}
      {cameraError && (
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <p className="text-xs text-white/70 text-center">{cameraError}</p>
        </div>
      )}
    </div>
  );
}
