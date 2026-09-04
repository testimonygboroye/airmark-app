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
    mutationFn: async () => { await apiClient.post(`/events/${eventId}/cameras/${camera._id}/live`, { teamId }); },
  });

  return (
    <button
      onClick={() => setLiveMutation.mutate()}
      disabled={setLiveMutation.isPending}
      className={`rounded-2xl overflow-hidden text-left transition-all border-2 ${
        camera.isLive ? "border-signal-red" : "border-standby-slate/20 dark:border-white/10"
      } bg-white dark:bg-white/5`}
    >
      <div className="relative aspect-[4/3] bg-black">
        {stream ? (
          <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className={`absolute inset-0 ${camera.isLive ? "bg-signal-red" : "bg-standby-slate/10 dark:bg-white/5"}`} />
        )}
      </div>
      <div className="px-3 py-2">
        <p className="font-display font-bold text-sm text-navy dark:text-surface-light">{camera.label}</p>
        {camera.operatorUserId ? (
          <p className="text-xs text-standby-slate dark:text-surface-light/70">{camera.operatorUserId.firstName} {camera.operatorUserId.lastName}</p>
        ) : (
          <p className="text-xs text-standby-slate/60">Unassigned</p>
        )}
        <p className={`text-xs font-bold tracking-wide mt-0.5 ${camera.isLive ? "text-signal-red" : "text-standby-slate dark:text-surface-light/60"}`}>
          {camera.isLive ? "● LIVE" : "STANDBY"}
        </p>
      </div>
    </button>
  );
}
