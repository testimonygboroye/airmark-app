import { useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useDirectorCameraStream } from "@/hooks/useDirectorCameraStream";
import type { CameraAssignmentRecord } from "@/types";

interface Props {
  camera: CameraAssignmentRecord;
  eventId: string;
  teamId: string;
}

export function DirectorCameraTile({ camera, eventId, teamId }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stream = useDirectorCameraStream(eventId, teamId, camera.operatorUserId?._id);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  const setLiveMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/events/${eventId}/cameras/${camera._id}/live`, { teamId });
    },
  });

  return (
    <button
      onClick={() => setLiveMutation.mutate()}
      disabled={setLiveMutation.isPending}
      className={`relative overflow-hidden rounded-2xl text-left transition-all border-2 aspect-[4/3] ${
        camera.isLive ? "border-signal-red" : "border-white/10"
      }`}
    >
      {stream ? (
        <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className={`absolute inset-0 ${camera.isLive ? "bg-signal-red" : "bg-white/5"}`} />
      )}
      <div className={`absolute inset-0 flex flex-col justify-between p-3 ${stream ? "bg-black/30" : ""}`}>
        <div>
          <p className="font-display font-bold text-base text-white drop-shadow">{camera.label}</p>
          {camera.operatorUserId ? (
            <p className="text-xs text-white/90 drop-shadow">
              {camera.operatorUserId.firstName} {camera.operatorUserId.lastName}
            </p>
          ) : (
            <p className="text-xs text-white/60">Unassigned</p>
          )}
        </div>
        <p className="text-xs font-bold tracking-wide text-white drop-shadow">
          {camera.isLive ? "● LIVE" : "STANDBY"}
        </p>
      </div>
    </button>
  );
}
