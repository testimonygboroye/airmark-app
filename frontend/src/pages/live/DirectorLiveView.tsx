import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { apiClient } from "@/lib/apiClient";
import { RunOfShowControls } from "@/components/live/RunOfShowControls";
import { SegmentBanner } from "@/components/live/SegmentBanner";
import { CountdownOverlay } from "@/components/live/CountdownOverlay";
import { CountdownControls } from "@/components/live/CountdownControls";
import { SignalInbox } from "@/components/live/SignalInbox";
import { useCountdown } from "@/hooks/useCountdown";
import type {
  EventRecord,
  CameraAssignmentRecord,
  RunOfShowSegmentRecord,
  SignalRecord,
} from "@/types";

interface Props {
  event: EventRecord;
  cameras: CameraAssignmentRecord[];
  eventId: string;
  segments: RunOfShowSegmentRecord[];
  currentSegment: RunOfShowSegmentRecord | null;
  nextSegment: RunOfShowSegmentRecord | null;
  countdownTargetAt: string | null;
  signals: SignalRecord[];
}

export function DirectorLiveView({
  event,
  cameras,
  eventId,
  segments,
  currentSegment,
  nextSegment,
  countdownTargetAt,
  signals,
}: Props) {
  const navigate = useNavigate();
  const { isActive: countdownActive } = useCountdown(countdownTargetAt);

  const setLiveMutation = useMutation({
    mutationFn: async (cameraId: string) => {
      await apiClient.post(`/events/${eventId}/cameras/${cameraId}/live`, {
        teamId: event.teamId,
      });
    },
  });

  return (
    <div className="min-h-screen flex flex-col relative">
      <CountdownOverlay targetAt={countdownTargetAt} />
      <SignalInbox eventId={eventId} teamId={event.teamId} signals={signals} />

      <header className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        <div>
          <p className="text-xs text-surface-light/50 uppercase tracking-wide">Director</p>
          <h1 className="font-display font-semibold">{event.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <CountdownControls eventId={eventId} teamId={event.teamId} isActive={countdownActive} />
          <button
            onClick={() => navigate(-1)}
            className="text-xs text-surface-light/60 font-medium px-3 py-1.5 rounded-lg border border-white/15"
          >
            Exit
          </button>
        </div>
      </header>

      <SegmentBanner currentSegment={currentSegment} nextSegment={nextSegment} />

      <div className="flex-1 px-4 py-6">
        <p className="text-xs text-surface-light/50 uppercase tracking-wide mb-3">
          Tap a camera to switch live
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {cameras.map((camera) => (
            <button
              key={camera._id}
              onClick={() => setLiveMutation.mutate(camera._id)}
              disabled={setLiveMutation.isPending}
              className={`rounded-2xl p-5 text-left transition-all border-2 ${
                camera.isLive
                  ? "bg-signal-red border-signal-red"
                  : "bg-white/5 border-white/10 active:bg-white/10"
              }`}
            >
              <p className="font-display font-bold text-lg">{camera.label}</p>
              {camera.operatorUserId ? (
                <p className="text-xs mt-1 opacity-80">
                  {camera.operatorUserId.firstName} {camera.operatorUserId.lastName}
                </p>
              ) : (
                <p className="text-xs mt-1 opacity-50">Unassigned</p>
              )}
              <p className="text-xs font-bold mt-3 tracking-wide">
                {camera.isLive ? "● LIVE" : "STANDBY"}
              </p>
            </button>
          ))}
        </div>
      </div>

      <RunOfShowControls
        eventId={eventId}
        teamId={event.teamId}
        segments={segments}
        currentSegmentId={currentSegment?._id}
      />
    </div>
  );
}
