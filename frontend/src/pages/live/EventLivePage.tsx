import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { getSocket } from "@/lib/socketClient";
import { useAuthStore } from "@/store/authStore";
import { useTeamRole } from "@/hooks/useTeamRole";
import { Spinner } from "@/components/ui/Button";
import { DirectorLiveView } from "./DirectorLiveView";
import { OperatorLiveView } from "./OperatorLiveView";
import type {
  EventRecord,
  CameraAssignmentRecord,
  RunOfShowSegmentRecord,
  SignalRecord,
  TalkbackMessageRecord,
} from "@/types";

export function EventLivePage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuthStore();
  const [cameras, setCameras] = useState<CameraAssignmentRecord[]>([]);
  const [segments, setSegments] = useState<RunOfShowSegmentRecord[]>([]);
  const [currentSegment, setCurrentSegment] = useState<RunOfShowSegmentRecord | null>(null);
  const [nextSegment, setNextSegment] = useState<RunOfShowSegmentRecord | null>(null);
  const [countdownTargetAt, setCountdownTargetAt] = useState<string | null>(null);
  const [signals, setSignals] = useState<SignalRecord[]>([]);
  const [latestTalkback, setLatestTalkback] = useState<TalkbackMessageRecord | null>(null);
  const [event, setEvent] = useState<EventRecord | null>(null);

  const { isLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const res = await apiClient.get<{
        data: {
          event: EventRecord;
          cameras: CameraAssignmentRecord[];
          segments: RunOfShowSegmentRecord[];
          currentSegment: RunOfShowSegmentRecord | null;
          nextSegment: RunOfShowSegmentRecord | null;
          countdownTargetAt: string | null;
        };
      }>(`/events/${eventId}`);
      setEvent(res.data.data.event);
      setCameras(res.data.data.cameras);
      setSegments(res.data.data.segments);
      setCurrentSegment(res.data.data.currentSegment);
      setNextSegment(res.data.data.nextSegment);
      setCountdownTargetAt(res.data.data.countdownTargetAt);
      return res.data.data;
    },
    enabled: !!eventId,
  });

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
    function handleSegmentsUpdated(payload: {
      eventId: string;
      segments: RunOfShowSegmentRecord[];
    }) {
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

    socket.on("tally:update", handleTallyUpdate);
    socket.on("cameras:update", handleCamerasUpdate);
    socket.on("ros:update", handleRosUpdate);
    socket.on("ros:segments-updated", handleSegmentsUpdated);
    socket.on("countdown:update", handleCountdownUpdate);
    socket.on("signal:new", handleSignalNew);
    socket.on("signal:ack", handleSignalAck);
    socket.on("talkback:new", handleTalkbackNew);

    return () => {
      socket.off("tally:update", handleTallyUpdate);
      socket.off("cameras:update", handleCamerasUpdate);
      socket.off("ros:update", handleRosUpdate);
      socket.off("ros:segments-updated", handleSegmentsUpdated);
      socket.off("countdown:update", handleCountdownUpdate);
      socket.off("signal:new", handleSignalNew);
      socket.off("signal:ack", handleSignalAck);
      socket.off("talkback:new", handleTalkbackNew);
    };
  }, [eventId, user?.id]);

  if (isLoading || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size={28} />
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
    <div className="min-h-screen flex items-center justify-center px-6 text-center">
      <p className="text-surface-light/60 text-sm">
        You're not assigned to a camera for this event yet.
      </p>
    </div>
  );
}
