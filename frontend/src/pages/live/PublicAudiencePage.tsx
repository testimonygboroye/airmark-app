import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { usePublicAudienceStream } from "@/hooks/usePublicAudienceStream";
import { LiveVideoPlayer } from "@/components/live/LiveVideoPlayer";

export function PublicAudiencePage() {
  const { token } = useParams<{ token: string }>();

  const { data, isError } = useQuery({
    queryKey: ["publicEvent", token],
    queryFn: async () => {
      const res = await apiClient.get(`/public/events/${token}`);
      return res.data.data as {
        eventId: string; teamId: string; title: string; status: string;
        liveCameraOperatorUserId: string | null; liveCameraLabel: string | null;
      };
    },
    enabled: !!token,
    refetchInterval: 5000,
  });

  const { stream } = usePublicAudienceStream(token ?? "", data?.teamId ?? "", data?.liveCameraOperatorUserId ?? undefined);

  if (isError) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-white text-sm px-6 text-center">
        This link is invalid or the event no longer exists.
      </div>
    );
  }

  return (
    <div className="h-screen bg-black">
      <LiveVideoPlayer
        stream={stream}
        statusLabel={
          !data ? "Loading…" :
          !data.liveCameraOperatorUserId ? `${data.title} — no camera is live right now` :
          `Connecting to ${data.liveCameraLabel}…`
        }
      />
    </div>
  );
}
