import { SegmentBanner } from "@/components/live/SegmentBanner";
import { CountdownOverlay } from "@/components/live/CountdownOverlay";
import { OperatorActionDock } from "@/components/live/OperatorActionDock";
import { TalkbackBanner } from "@/components/live/TalkbackBanner";
import type { CameraAssignmentRecord, RunOfShowSegmentRecord, TalkbackMessageRecord } from "@/types";

interface Props {
  camera: CameraAssignmentRecord;
  cameras: CameraAssignmentRecord[];
  currentSegment: RunOfShowSegmentRecord | null;
  nextSegment: RunOfShowSegmentRecord | null;
  countdownTargetAt: string | null;
  eventId: string;
  teamId: string;
  latestTalkback: TalkbackMessageRecord | null;
}

export function OperatorLiveView({
  camera,
  cameras,
  currentSegment,
  nextSegment,
  countdownTargetAt,
  eventId,
  teamId,
  latestTalkback,
}: Props) {
  const liveCamera = cameras.find((c) => c.isLive);

  return (
    <div
      className={`min-h-screen flex flex-col relative transition-colors duration-300 ${
        camera.isLive ? "bg-signal-red text-white" : "bg-navy text-surface-light"
      }`}
    >
      <CountdownOverlay targetAt={countdownTargetAt} />
      <TalkbackBanner message={latestTalkback} />

      <SegmentBanner currentSegment={currentSegment} nextSegment={nextSegment} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <p className="text-sm font-medium opacity-70 tracking-widest uppercase mb-3">
          {camera.label} (You)
        </p>
        <h1 className="font-display text-6xl font-bold tracking-tight mb-4">
          {camera.isLive ? "LIVE" : "STANDBY"}
        </h1>
        <p className="text-xs opacity-60 text-center max-w-xs">
          Airmark controls when to switch — it doesn't capture or show video. Keep your actual
          camera pointed and ready; this screen just tells you whether you're on-air right now.
        </p>

        {!camera.isLive && liveCamera && (
          <div className="mt-6 px-5 py-3 rounded-xl bg-white/10 backdrop-blur-sm">
            <p className="text-xs opacity-60 text-center">Currently live</p>
            <p className="font-display font-semibold text-center">{liveCamera.label}</p>
          </div>
        )}
      </div>

      <OperatorActionDock eventId={eventId} teamId={teamId} cameraId={camera._id} />

      <p className="pb-28 text-xs opacity-40 px-6 text-center">
        Wait for this screen to show LIVE before repositioning your camera.
      </p>
    </div>
  );
}
