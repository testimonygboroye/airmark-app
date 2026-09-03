import { SegmentBanner } from "@/components/live/SegmentBanner";
import { CountdownOverlay } from "@/components/live/CountdownOverlay";
import { OperatorActionDock } from "@/components/live/OperatorActionDock";
import { OperatorCameraPreview } from "@/components/live/OperatorCameraPreview";
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
  camera, cameras, currentSegment, nextSegment, countdownTargetAt, eventId, teamId, latestTalkback,
}: Props) {
  const liveCamera = cameras.find((c) => c.isLive);

  return (
    <div className={`min-h-screen flex flex-col relative transition-colors duration-300 ${camera.isLive ? "bg-signal-red text-white" : "bg-navy text-surface-light"}`}>
      <CountdownOverlay targetAt={countdownTargetAt} />
      <TalkbackBanner message={latestTalkback} />
      <SegmentBanner currentSegment={currentSegment} nextSegment={nextSegment} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-5">
        <p className="text-sm font-medium opacity-70 tracking-widest uppercase">{camera.label} (You)</p>
        <h1 className="font-display text-5xl font-bold tracking-tight">{camera.isLive ? "LIVE" : "STANDBY"}</h1>

        <OperatorCameraPreview eventId={eventId} teamId={teamId} />

        {!camera.isLive && liveCamera && (
          <div className="px-5 py-3 rounded-xl bg-white/10 backdrop-blur-sm">
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
