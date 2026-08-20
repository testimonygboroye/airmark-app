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
} from "@/types";

export function EventLivePage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuthStore();
  const [cameras, setCameras] = useState<CameraAssignmentRecord[]>([]);
  const [segments, setSegments] = useState<RunOfShowSegmentRecord[]>([]);
  const [currentSegment, setCurrentSegment] = useState<RunOfShowSegmentRecord | null>(null);
  const [nextSegment, setNextSegment] = useState<RunOfShowSegmentRecord | null>(null);
  const [countdownTargetAt, setCountdownTargetAt] = useState<string | null>(null);
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

    socket.on("tally:update", handleTallyUpdate);
    socket.on("cameras:update", handleCamerasUpdate);
    socket.on("ros:update", handleRosUpdate);
    socket.on("ros:segments-updated", handleSegmentsUpdated);
    socket.on("countdown:update", handleCountdownUpdate);

    return () => {
      socket.off("tally:update", handleTallyUpdate);
      socket.off("cameras:update", handleCamerasUpdate);
      socket.off("ros:update", handleRosUpdate);
      socket.off("ros:segments-updated", handleSegmentsUpdated);
      socket.off("countdown:update", handleCountdownUpdate);
    };
  }, [eventId]);

  if (isLoading || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size={28} />
      </div>
    );
  }

  const myCamera = cameras.find((c) => c.operatorUserId?._id === user?.id);
  const isDirector = hasPermission("tally:control");

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
