import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { usePublicAudienceStream } from "@/hooks/usePublicAudienceStream";

/**
 * Minimal, chrome-free page meant to be pasted into OBS's own "Browser
 * Source" URL field. OBS renders this using a real embedded browser, so
 * the operator's live WebRTC camera feed appears as a genuine OBS source
 * — no plugin, no extra software, using an OBS feature that already
 * exists. Uses the same public share-token auth as the audience link,
 * so it needs no Airmark login on the laptop.
 */
export function ObsCameraSourcePage() {
  const { token, operatorUserId } = useParams<{ token: string; operatorUserId: string }>();

  const { data } = useQuery({
    queryKey: ["publicEvent", token],
    queryFn: async () => {
      const res = await apiClient.get(`/public/events/${token}`);
      return res.data.data as { teamId: string };
    },
    enabled: !!token,
  });

  const { stream } = usePublicAudienceStream(token ?? "", data?.teamId ?? "", operatorUserId);

  return (
    <div className="w-screen h-screen bg-black">
      <video
        autoPlay
        playsInline
        muted={false}
        ref={(el) => { if (el) el.srcObject = stream; }}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
