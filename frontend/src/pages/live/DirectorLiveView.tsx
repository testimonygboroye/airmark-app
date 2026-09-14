import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { apiClient } from "@/lib/apiClient";
import { RunOfShowControls } from "@/components/live/RunOfShowControls";
import { SegmentBanner } from "@/components/live/SegmentBanner";
import { CountdownOverlay } from "@/components/live/CountdownOverlay";
import { CountdownControls } from "@/components/live/CountdownControls";
import { SignalInbox } from "@/components/live/SignalInbox";
import { TalkbackControls } from "@/components/live/TalkbackControls";
import { MarkButton } from "@/components/live/MarkButton";
import { ObsPairingPanel } from "@/components/live/ObsPairingPanel";
import { DirectStreamPanel } from "@/components/live/DirectStreamPanel";
import { AudienceLinkPanel } from "@/components/live/AudienceLinkPanel";
import { ObsSceneSwitcher } from "@/components/live/ObsSceneSwitcher";
import { ObsTransitionControls } from "@/components/live/ObsTransitionControls";
import { ObsSceneItemsPanel } from "@/components/live/ObsSceneItemsPanel";
import { ObsTextOverlayPanel } from "@/components/live/ObsTextOverlayPanel";
import { ObsHealthMonitor } from "@/components/live/ObsHealthMonitor";
import { ObsFailsafeControls } from "@/components/live/ObsFailsafeControls";
import { ObsWatermarkControls } from "@/components/live/ObsWatermarkControls";
import { ObsCountdownOverlayControls } from "@/components/live/ObsCountdownOverlayControls";
import { ObsAudioControls } from "@/components/live/ObsAudioControls";
import { ObsReplayButton } from "@/components/live/ObsReplayButton";
import { ObsFavoriteOverlays } from "@/components/live/ObsFavoriteOverlays";
import { ObsIntroOutroSettings } from "@/components/live/ObsIntroOutroSettings";
import { DirectorCameraTile } from "@/components/live/DirectorCameraTile";
import { useCountdown } from "@/hooks/useCountdown";
import type { EventRecord, CameraAssignmentRecord, RunOfShowSegmentRecord, SignalRecord, ObsConnectionRecord } from "@/types";

interface Props {
  event: EventRecord;
  cameras: CameraAssignmentRecord[];
  eventId: string;
  segments: RunOfShowSegmentRecord[];
  currentSegment: RunOfShowSegmentRecord | null;
  nextSegment: RunOfShowSegmentRecord | null;
  countdownTargetAt: string | null;
  countdownPausedRemainingMs?: number | null;
  signals: SignalRecord[];
  obsConnection: ObsConnectionRecord;
}

export function DirectorLiveView({
  event, cameras, eventId, segments, currentSegment, nextSegment,
  countdownTargetAt, countdownPausedRemainingMs, signals, obsConnection,
}: Props) {
  const navigate = useNavigate();
  const { isActive: countdownActive } = useCountdown(countdownTargetAt);
  const isPaused = !countdownActive && !!countdownPausedRemainingMs;

  const startMutation = useMutation({
    mutationFn: async () => { await apiClient.post(`/events/${eventId}/start`, { teamId: event.teamId }); },
  });
  const endMutation = useMutation({
    mutationFn: async () => {
      if (!window.confirm("End this event? Tally control will be disabled until it's reopened.")) throw new Error("cancelled");
      await apiClient.post(`/events/${eventId}/end`, { teamId: event.teamId });
    },
  });

  const obsConnected = obsConnection.status === "connected";
  const btnBase = "text-xs font-medium px-3 py-1.5 rounded-lg border border-standby-slate/30 dark:border-white/15 text-standby-slate dark:text-surface-light/70";

  return (
    <div className="min-h-full flex flex-col relative bg-surface-light dark:bg-navy text-navy dark:text-surface-light pb-16">
      <SignalInbox eventId={eventId} teamId={event.teamId} signals={signals} />
      <CountdownOverlay targetAt={countdownTargetAt} pausedRemainingMs={countdownPausedRemainingMs} />
      <MarkButton eventId={eventId} teamId={event.teamId} />
      {obsConnected && (
        <ObsFailsafeControls eventId={eventId} teamId={event.teamId} scenes={obsConnection.scenes} fallbackSceneName={obsConnection.fallbackSceneName} streamStatus={obsConnection.streamStatus} recordStatus={obsConnection.recordStatus} />
      )}

      <header className="flex items-center justify-between px-4 py-4 border-b border-standby-slate/15 dark:border-white/10 flex-wrap gap-2">
        <div>
          <p className="text-xs text-standby-slate dark:text-surface-light/50 uppercase tracking-wide">Director</p>
          <h1 className="font-display font-semibold">{event.title}</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {event.status !== "live" && event.status !== "ended" && (
            <button onClick={() => startMutation.mutate()} disabled={startMutation.isPending} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-signal-red text-white">
              Start Event
            </button>
          )}
          {event.status === "live" && (
            <button onClick={() => endMutation.mutate()} disabled={endMutation.isPending} className={btnBase}>
              End Event
            </button>
          )}
          <ObsPairingPanel eventId={eventId} teamId={event.teamId} connected={obsConnected} />
          <DirectStreamPanel eventId={eventId} teamId={event.teamId} />
          <AudienceLinkPanel eventId={eventId} />
          {obsConnected && (
            <>
              <ObsTextOverlayPanel eventId={eventId} teamId={event.teamId} items={obsConnection.sceneItems ?? []} />
              <ObsWatermarkControls eventId={eventId} teamId={event.teamId} items={obsConnection.sceneItems ?? []} watermarkSceneItemId={obsConnection.watermarkSceneItemId} />
              <ObsCountdownOverlayControls eventId={eventId} teamId={event.teamId} items={obsConnection.sceneItems ?? []} countdownActive={countdownActive} />
              <ObsAudioControls eventId={eventId} teamId={event.teamId} />
              <ObsReplayButton eventId={eventId} teamId={event.teamId} />
              <ObsIntroOutroSettings eventId={eventId} teamId={event.teamId} scenes={obsConnection.scenes} introSceneName={obsConnection.introSceneName} introDurationSeconds={obsConnection.introDurationSeconds} outroSceneName={obsConnection.outroSceneName} outroDurationSeconds={obsConnection.outroDurationSeconds} />
            </>
          )}
          <TalkbackControls eventId={eventId} teamId={event.teamId} cameras={cameras} />
          <CountdownControls eventId={eventId} teamId={event.teamId} isActive={countdownActive} isPaused={isPaused} />
          <button onClick={() => navigate(-1)} className={btnBase}>Exit</button>
        </div>
      </header>

      {obsConnected && <ObsHealthMonitor streamStatus={obsConnection.streamStatus} recordStatus={obsConnection.recordStatus} />}

      <SegmentBanner currentSegment={currentSegment} nextSegment={nextSegment} />

      <div className="flex-1 px-4 py-6">
        <p className="text-xs text-standby-slate dark:text-surface-light/50 uppercase tracking-wide mb-3">
          Tap a camera to switch live — live video shows automatically once that operator opens Go Live
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {cameras.map((camera) => (
            <DirectorCameraTile key={camera._id} camera={camera} eventId={eventId} teamId={event.teamId} />
          ))}
        </div>
      </div>

      {obsConnected && (
        <>
          <ObsSceneSwitcher eventId={eventId} teamId={event.teamId} scenes={obsConnection.scenes} currentProgramScene={obsConnection.currentProgramScene} />
          <ObsTransitionControls eventId={eventId} teamId={event.teamId} transitions={obsConnection.transitions ?? []} currentTransition={obsConnection.currentTransition} transitionDurationMs={obsConnection.transitionDurationMs} />
          <ObsSceneItemsPanel eventId={eventId} teamId={event.teamId} items={obsConnection.sceneItems ?? []} />
          <ObsFavoriteOverlays eventId={eventId} teamId={event.teamId} items={obsConnection.sceneItems ?? []} favorites={obsConnection.favoriteOverlays ?? []} />
        </>
      )}

      <RunOfShowControls eventId={eventId} teamId={event.teamId} segments={segments} currentSegmentId={currentSegment?._id} />
    </div>
  );
}
