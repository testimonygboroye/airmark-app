import { useState } from "react";
import { SegmentBanner } from "@/components/live/SegmentBanner";
import { CountdownOverlay } from "@/components/live/CountdownOverlay";
import { OperatorActionDock } from "@/components/live/OperatorActionDock";
import { OperatorCameraPreview } from "@/components/live/OperatorCameraPreview";
import { TalkbackBanner } from "@/components/live/TalkbackBanner";
import { useOperatorCamera } from "@/hooks/useOperatorCamera";
import type { CameraAssignmentRecord, RunOfShowSegmentRecord, TalkbackMessageRecord } from "@/types";

interface Props {
  camera: CameraAssignmentRecord;
  cameras: CameraAssignmentRecord[];
  currentSegment: RunOfShowSegmentRecord | null;
  nextSegment: RunOfShowSegmentRecord | null;
  countdownTargetAt: string | null;
  countdownPausedRemainingMs?: number | null;
  eventId: string;
  teamId: string;
  latestTalkback: TalkbackMessageRecord | null;
}

export function OperatorLiveView({
  camera, currentSegment, nextSegment, countdownTargetAt, countdownPausedRemainingMs, eventId, teamId, latestTalkback,
}: Props) {
  const cam = useOperatorCamera(eventId, teamId, true);
  const [zoomValue, setZoomValue] = useState(1);

  return (
    <div className="h-full overflow-hidden flex flex-col bg-navy text-surface-light">
      <TalkbackBanner message={latestTalkback} />
      <SegmentBanner currentSegment={currentSegment} nextSegment={nextSegment} />
      <CountdownOverlay targetAt={countdownTargetAt} pausedRemainingMs={countdownPausedRemainingMs} />

      <p className="shrink-0 text-xs font-medium opacity-70 tracking-widest uppercase text-center py-2">
        {camera.label} (You)
      </p>

      <OperatorCameraPreview
        videoRef={cam.localVideoRef}
        hasCamera={cam.hasCamera}
        cameraError={cam.cameraError}
        zoomSupported={cam.zoomSupported}
        zoomRange={cam.zoomRange}
        zoomValue={zoomValue}
        onZoomChange={(v) => { setZoomValue(v); cam.setZoom(v); }}
      />

      <div className={`shrink-0 flex items-center justify-between gap-2 px-4 py-2.5 flex-wrap ${camera.isLive ? "bg-signal-red" : "bg-navy"} border-t border-white/10`}>
        <div className="flex items-center gap-1.5">
          <span className={`w-3 h-3 rounded-full ${camera.isLive ? "bg-white" : "bg-white/30"}`} />
          <span className="text-[10px] font-bold tracking-wide">{camera.isLive ? "LIVE" : "STANDBY"}</span>
        </div>
        <OperatorActionDock
          eventId={eventId}
          teamId={teamId}
          cameraId={camera._id}
          torchSupported={cam.torchSupported}
          torchOn={cam.torchOn}
          onToggleTorch={cam.toggleTorch}
          canFlipCamera={cam.canFlipCamera}
          onFlipCamera={cam.flipCamera}
        />
      </div>
    </div>
  );
}
