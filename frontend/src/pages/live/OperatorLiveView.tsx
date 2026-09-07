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
  camera, currentSegment, nextSegment, countdownTargetAt, eventId, teamId, latestTalkback,
}: Props) {
  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-navy text-surface-light">
      <TalkbackBanner message={latestTalkback} />
      <SegmentBanner currentSegment={currentSegment} nextSegment={nextSegment} />
      <CountdownOverlay targetAt={countdownTargetAt} />

      <p className="shrink-0 text-xs font-medium opacity-70 tracking-widest uppercase text-center py-2">
        {camera.label} (You)
      </p>

      {/* Video now takes the full remaining space — status moved down to
          share one row with the action icons instead of its own row. */}
      <OperatorCameraPreview eventId={eventId} teamId={teamId} />

      <div className={`shrink-0 flex items-center justify-between px-4 py-2.5 ${camera.isLive ? "bg-signal-red" : "bg-navy"} border-t border-white/10`}>
        <div className="flex items-center gap-1.5">
          <span className={`w-3 h-3 rounded-full ${camera.isLive ? "bg-white" : "bg-white/30"}`} />
          <span className="text-[10px] font-bold tracking-wide">{camera.isLive ? "LIVE" : "STANDBY"}</span>
        </div>
        <OperatorActionDock eventId={eventId} teamId={teamId} cameraId={camera._id} inline />
      </div>
    </div>
  );
}
