import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { usePublicAudienceStream } from "@/hooks/usePublicAudienceStream";
import { LiveVideoPlayer } from "@/components/live/LiveVideoPlayer";

export function PublicAudiencePage() {
  const { token } = useParams<{ token: string }>();

  const { data, isError, isLoading } = useQuery({
    queryKey: ["publicEvent", token],
    queryFn: async () => {
      const res = await apiClient.get(`/public/events/${token}`);
      return res.data.data as { eventId: string; teamId: string; title: string; status: string; liveCameraOperatorUserId: string | null };
    },
    enabled: !!token,
    refetchInterval: 5000,
  });

  const { stream, status } = usePublicAudienceStream(token ?? "", data?.teamId ?? "", data?.liveCameraOperatorUserId ?? undefined);

  const phase = isError ? "error" : isLoading ? "loading" : !data?.liveCameraOperatorUserId ? "no_live_camera" : stream ? "playing" : status === "reconnecting" ? "reconnecting" : "connecting";

  return <LiveVideoPlayer stream={stream} phase={phase} />;
}
