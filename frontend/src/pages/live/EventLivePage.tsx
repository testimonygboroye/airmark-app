import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/errors";
import { getSocket } from "@/lib/socketClient";
import { useAuthStore } from "@/store/authStore";
import { useTeamRole } from "@/hooks/useTeamRole";
import { Spinner, Button } from "@/components/ui/Button";
import { DirectorLiveView } from "./DirectorLiveView";
import { OperatorLiveView } from "./OperatorLiveView";
import type {
  EventRecord,
  CameraAssignmentRecord,
  RunOfShowSegmentRecord,
  SignalRecord,
  TalkbackMessageRecord,
  ObsConnectionRecord,
} from "@/types";

interface EventDetailResponse {
  event: EventRecord;
  cameras: CameraAssignmentRecord[];
  segments: RunOfShowSegmentRecord[];
  currentSegment: RunOfShowSegmentRecord | null;
  nextSegment: RunOfShowSegmentRecord | null;
  countdownTargetAt: string | null;
  countdownPausedRemainingMs: number | null;
}

export function EventLivePage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuthStore();

  const [event, setEvent] = useState<EventRecord | null>(null);
  const [cameras, setCameras] = useState<CameraAssignmentRecord[]>([]);
  const [segments, setSegments] = useState<RunOfShowSegmentRecord[]>([]);
  const [currentSegment, setCurrentSegment] = useState<RunOfShowSegmentRecord | null>(null);
  const [nextSegment, setNextSegment] = useState<RunOfShowSegmentRecord | null>(null);
  const [countdownTargetAt, setCountdownTargetAt] = useState<string | null>(null);
  const [countdownPausedRemainingMs, setCountdownPausedRemainingMs] = useState<number | null>(null);
  const [signals, setSignals] = useState<SignalRecord[]>([]);
  const [latestTalkback, setLatestTalkback] = useState<TalkbackMessageRecord | null>(null);
  const [obsConnection, setObsConnection] = useState<ObsConnectionRecord>({
    status: "disconnected",
    scenes: [],
    transitions: [],
    sceneItems: [],
  });

  const {
    data: eventData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["eventLive", eventId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: EventDetailResponse }>(`/events/${eventId}`);
      return res.data.data;
    },
    enabled: !!eventId,
    retry: 1,
  });

  useEffect(() => {
    if (!eventData) return;
    setEvent(eventData.event);
    setCameras(eventData.cameras);
    setSegments(eventData.segments);
    setCurrentSegment(eventData.currentSegment);
    setNextSegment(eventData.nextSegment);
    setCountdownTargetAt(eventData.countdownTargetAt);
      setCountdownPausedRemainingMs((eventData as any).countdownPausedRemainingMs ?? null);
  }, [eventData]);

  const { hasPermission } = useTeamRole(event?.teamId);
  const isDirector = hasPermission("tally:control");

  useEffect(() => {
    if (!isDirector || !eventId) return;
    apiClient
      .get<{ data: SignalRecord[] }>(`/events/${eventId}/signals`)
      .then((res) => setSignals(res.data.data))
      .catch(() => {});
  }, [isDirector, eventId]);

  useEffect(() => {
    if (!hasPermission("obs:control") || !eventId || !event?.teamId) return;
    apiClient
      .get<{ data: ObsConnectionRecord }>(`/events/${eventId}/obs/status`, {
        params: { teamId: event.teamId },
      })
      .then((res) => setObsConnection(res.data.data))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, event?.teamId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    function handleTallyUpdate(payload: { eventId: string; cameras: CameraAssignmentRecord[] }) {
      if (payload.eventId === eventId) setCameras(payload.cameras);
    }
    function handleCamerasUpdate(payload: { eventId: string; cameras: CameraAssignmentRecord[] }) {
      if (payload.eventId === eventId) setCameras(payload.cameras);
    }
    function handleRosUpdate(payload: {
      eventId: string;
      currentSegment: RunOfShowSegmentRecord | null;
      nextSegment: RunOfShowSegmentRecord | null;
    }) {
      if (payload.eventId === eventId) {
        setCurrentSegment(payload.currentSegment);
        setNextSegment(payload.nextSegment);
      }
    }
    function handleSegmentsUpdated(payload: { eventId: string; segments: RunOfShowSegmentRecord[] }) {
      if (payload.eventId === eventId) setSegments(payload.segments);
    }
    function handleCountdownUpdate(payload: { eventId: string; targetAt: string | null }) {
      if (payload.eventId === eventId) setCountdownTargetAt(payload.targetAt);
    }
    function handleSignalNew(payload: { eventId: string; signal: SignalRecord }) {
      if (payload.eventId === eventId) setSignals((prev) => [payload.signal, ...prev]);
    }
    function handleSignalAck(payload: { eventId: string; signal: SignalRecord }) {
      if (payload.eventId === eventId) {
        setSignals((prev) => prev.map((s) => (s._id === payload.signal._id ? payload.signal : s)));
      }
    }
    function handleTalkbackNew(payload: { eventId: string; message: TalkbackMessageRecord }) {
      if (payload.eventId === eventId && payload.message.toUserId === user?.id) {
        setLatestTalkback(payload.message);
      }
    }
    /**
     * This is the fix — previously nothing updated event.status after
     * Start/End Event, so the buttons appeared to "do nothing" even
     * though the request succeeded on the server every time.
     */
    function handleEventStatusUpdate(payload: {
      eventId: string;
      status: "scheduled" | "live" | "ended";
      actualStartAt?: string;
      endedAt?: string;
    }) {
      if (payload.eventId === eventId) {
        setEvent((prev) => (prev ? { ...prev, status: payload.status } : prev));
      }
    }
    function handleObsStatus(payload: { eventId: string; status: "connected" | "disconnected" }) {
      if (payload.eventId === eventId) setObsConnection((prev) => ({ ...prev, status: payload.status }));
    }
    function handleObsFullUpdate(payload: any) {
      if (payload.eventId === eventId) {
        setObsConnection({
          status: "connected",
          scenes: payload.scenes,
          currentProgramScene: payload.currentProgramScene,
          transitions: payload.transitions,
          currentTransition: payload.currentTransition,
          transitionDurationMs: payload.transitionDurationMs,
          sceneItems: payload.sceneItems,
        });
      }
    }
    function handleObsSceneChanged(payload: { eventId: string; currentProgramScene: string }) {
      if (payload.eventId === eventId) setObsConnection((prev) => ({ ...prev, currentProgramScene: payload.currentProgramScene }));
    }
    function handleObsSceneItemsUpdate(payload: any) {
      if (payload.eventId === eventId) setObsConnection((prev) => ({ ...prev, sceneItems: payload.items }));
    }
    function handleObsSceneItemToggled(payload: any) {
      if (payload.eventId === eventId) {
        setObsConnection((prev) => ({
          ...prev,
          sceneItems: (prev.sceneItems ?? []).map((item) =>
            item.sceneItemId === payload.sceneItemId ? { ...item, sceneItemEnabled: payload.sceneItemEnabled } : item
          ),
        }));
      }
    }
    function handleObsTransitionChanged(payload: { eventId: string; transitionName: string }) {
      if (payload.eventId === eventId) setObsConnection((prev) => ({ ...prev, currentTransition: payload.transitionName }));
    }

    socket.on("tally:update", handleTallyUpdate);
    socket.on("cameras:update", handleCamerasUpdate);
    socket.on("ros:update", handleRosUpdate);
    socket.on("ros:segments-updated", handleSegmentsUpdated);
    socket.on("countdown:update", handleCountdownUpdate);
    socket.on("signal:new", handleSignalNew);
    socket.on("signal:ack", handleSignalAck);
    socket.on("talkback:new", handleTalkbackNew);
    socket.on("event:status-update", handleEventStatusUpdate);
    socket.on("obs:status", handleObsStatus);
    socket.on("obs:full-update", handleObsFullUpdate);
    socket.on("obs:scene-changed", handleObsSceneChanged);
    socket.on("obs:scene-items-update", handleObsSceneItemsUpdate);
    socket.on("obs:scene-item-toggled", handleObsSceneItemToggled);
    socket.on("obs:transition-changed", handleObsTransitionChanged);

    return () => {
      socket.off("tally:update", handleTallyUpdate);
      socket.off("cameras:update", handleCamerasUpdate);
      socket.off("ros:update", handleRosUpdate);
      socket.off("ros:segments-updated", handleSegmentsUpdated);
      socket.off("countdown:update", handleCountdownUpdate);
      socket.off("signal:new", handleSignalNew);
      socket.off("signal:ack", handleSignalAck);
      socket.off("talkback:new", handleTalkbackNew);
      socket.off("event:status-update", handleEventStatusUpdate);
      socket.off("obs:status", handleObsStatus);
      socket.off("obs:full-update", handleObsFullUpdate);
      socket.off("obs:scene-changed", handleObsSceneChanged);
      socket.off("obs:scene-items-update", handleObsSceneItemsUpdate);
      socket.off("obs:scene-item-toggled", handleObsSceneItemToggled);
      socket.off("obs:transition-changed", handleObsTransitionChanged);
    };
  }, [eventId, user?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <Spinner size={28} />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center bg-navy text-surface-light">
        <p className="text-surface-light/70 text-sm">
          {getErrorMessage(error, "Couldn't load this event. Check your connection.")}
        </p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const myCamera = cameras.find((c) => c.operatorUserId?._id === user?.id);

  if (isDirector) {
    return (
      <DirectorLiveView
        event={event}
        cameras={cameras}
        eventId={eventId!}
        segments={segments}
        currentSegment={currentSegment}
        nextSegment={nextSegment}
        countdownTargetAt={countdownTargetAt}
        signals={signals}
        obsConnection={obsConnection}
      />
    );
  }

  if (myCamera) {
    return (
      <OperatorLiveView
        camera={myCamera}
        cameras={cameras}
        currentSegment={currentSegment}
        nextSegment={nextSegment}
        countdownTargetAt={countdownTargetAt}
        eventId={eventId!}
        teamId={event.teamId}
        latestTalkback={latestTalkback}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center bg-navy text-surface-light">
      <p className="text-surface-light/60 text-sm">
        You're not assigned to a camera for this event yet.
      </p>
    </div>
  );
}
