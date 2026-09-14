import { useEffect } from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useDirectorCameraStream } from "@/hooks/useDirectorCameraStream";
import { LiveVideoPlayer } from "@/components/live/LiveVideoPlayer";
import type { CameraAssignmentRecord, EventRecord } from "@/types";

export function EditorAudienceViewPage() {
  const { eventId } = useParams<{ eventId: string }>();

  const { data } = useQuery({
    queryKey: ["eventLive", eventId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: { event: EventRecord; cameras: CameraAssignmentRecord[] } }>(`/events/${eventId}`);
      return res.data.data;
    },
    enabled: !!eventId,
    refetchInterval: 3000,
  });

  const liveCamera = data?.cameras.find((c) => c.isLive);
  const { stream } = useDirectorCameraStream(eventId ?? "", data?.event.teamId ?? "", liveCamera?.operatorUserId?._id);

  return (
    <div className="h-screen bg-black">
      <LiveVideoPlayer
        stream={stream}
        statusLabel={liveCamera ? `Connecting to ${liveCamera.label}…` : "No camera is currently live"}
      />
    </div>
  );
}
