import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useDirectorCameraStream } from "@/hooks/useDirectorCameraStream";
import { LiveVideoPlayer } from "@/components/live/LiveVideoPlayer";
import type { CameraAssignmentRecord, EventRecord } from "@/types";

export function AudienceViewPage() {
  const { eventId } = useParams<{ eventId: string }>();

  const { data, isError, isLoading } = useQuery({
    queryKey: ["eventLive", eventId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: { event: EventRecord; cameras: CameraAssignmentRecord[] } }>(`/events/${eventId}`);
      return res.data.data;
    },
    enabled: !!eventId,
    refetchInterval: 3000,
  });

  const liveCamera = data?.cameras.find((c) => c.isLive);
  const { stream, status } = useDirectorCameraStream(eventId ?? "", data?.event.teamId ?? "", liveCamera?.operatorUserId?._id);

  const phase = isError ? "error" : isLoading ? "loading" : !liveCamera ? "no_live_camera" : stream ? "playing" : status === "reconnecting" ? "reconnecting" : "connecting";

  return <LiveVideoPlayer stream={stream} phase={phase} />;
}
