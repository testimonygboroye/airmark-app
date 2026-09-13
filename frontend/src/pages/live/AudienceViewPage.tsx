import { useEffect, useRef } from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useDirectorCameraStream } from "@/hooks/useDirectorCameraStream";
import type { CameraAssignmentRecord, EventRecord } from "@/types";

export function AudienceViewPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);

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
  const { stream, status } = useDirectorCameraStream(eventId ?? "", data?.event.teamId ?? "", liveCamera?.operatorUserId?._id);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-white">
      {liveCamera && stream ? (
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
      ) : (
        <div className="text-center px-6">
          <p className="text-sm text-white/60 mb-2">
            {liveCamera ? `Connecting to ${liveCamera.label}… (${status})` : "No camera is currently live"}
          </p>
        </div>
      )}
      <p className="fixed bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-white/40 text-center px-4">
        This shows Airmark's live camera feed directly. If this team streams via OBS or Direct Stream, the actual
        audience broadcast lives on YouTube/Facebook/etc, not here.
      </p>
    </div>
  );
}
