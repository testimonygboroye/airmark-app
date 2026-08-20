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
import type { EventRecord, CameraAssignmentRecord } from "@/types";

export function EventLivePage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuthStore();
  const [cameras, setCameras] = useState<CameraAssignmentRecord[]>([]);
  const [event, setEvent] = useState<EventRecord | null>(null);

  const { isLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: { event: EventRecord; cameras: CameraAssignmentRecord[] } }>(
        `/events/${eventId}`
      );
      setEvent(res.data.data.event);
      setCameras(res.data.data.cameras);
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

    socket.on("tally:update", handleTallyUpdate);
    socket.on("cameras:update", handleCamerasUpdate);

    return () => {
      socket.off("tally:update", handleTallyUpdate);
      socket.off("cameras:update", handleCamerasUpdate);
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
    return <DirectorLiveView event={event} cameras={cameras} eventId={eventId!} />;
  }

  if (myCamera) {
    return <OperatorLiveView camera={myCamera} cameras={cameras} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center">
      <div>
        <p className="text-surface-light/60 text-sm">
          You're not assigned to a camera for this event yet.
        </p>
      </div>
    </div>
  );
}
