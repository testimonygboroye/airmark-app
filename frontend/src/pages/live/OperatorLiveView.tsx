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
    <div className="h-[calc(100dvh-113px)] flex flex-col overflow-hidden bg-navy text-surface-light">
      <CountdownOverlay targetAt={countdownTargetAt} />
      <TalkbackBanner message={latestTalkback} />
      <SegmentBanner currentSegment={currentSegment} nextSegment={nextSegment} />

      {/* Camera identification — only text between header and video */}
      <p className="text-xs font-medium opacity-70 tracking-widest uppercase text-center py-2 shrink-0">
        {camera.label} (You)
      </p>

      <OperatorCameraPreview eventId={eventId} teamId={teamId} />

      {/* Icons + status dot row — the only thing between video and bottom nav */}
      <div className={`shrink-0 flex items-center justify-between px-4 py-2.5 ${camera.isLive ? "bg-signal-red" : "bg-navy"}`}>
        <div className="flex items-center gap-1.5">
          <span className={`w-3 h-3 rounded-full ${camera.isLive ? "bg-white" : "bg-white/30"}`} />
          <span className="text-[10px] font-bold tracking-wide">{camera.isLive ? "LIVE" : "STANDBY"}</span>
        </div>
        <OperatorActionDock eventId={eventId} teamId={teamId} cameraId={camera._id} inline />
      </div>
    </div>
  );
}
