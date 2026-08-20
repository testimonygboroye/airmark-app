import type { CameraAssignmentRecord } from "@/types";

interface Props {
  camera: CameraAssignmentRecord;
  cameras: CameraAssignmentRecord[];
}

export function OperatorLiveView({ camera, cameras }: Props) {
  const liveCamera = cameras.find((c) => c.isLive);

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 ${
        camera.isLive ? "bg-signal-red" : "bg-navy"
      }`}
    >
      <p className="text-sm font-medium opacity-70 tracking-widest uppercase mb-3">
        {camera.label} (You)
      </p>
      <h1 className="font-display text-6xl font-bold tracking-tight mb-6">
        {camera.isLive ? "LIVE" : "STANDBY"}
      </h1>

      {!camera.isLive && liveCamera && (
        <div className="mt-4 px-5 py-3 rounded-xl bg-white/10 backdrop-blur-sm">
          <p className="text-xs text-surface-light/60 text-center">Currently live</p>
          <p className="font-display font-semibold text-center">{liveCamera.label}</p>
        </div>
      )}

      <p className="absolute bottom-8 text-xs text-surface-light/40 px-6 text-center">
        Wait for this screen to show LIVE before repositioning your camera.
      </p>
    </div>
  );
}
