import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { ObsSceneRecord, ObsStreamStatus, ObsRecordStatus } from "@/types";

interface Props {
  eventId: string;
  teamId: string;
  scenes: ObsSceneRecord[];
  fallbackSceneName?: string;
  streamStatus?: ObsStreamStatus;
  recordStatus?: ObsRecordStatus;
}

export function ObsFailsafeControls({
  eventId,
  teamId,
  scenes,
  fallbackSceneName,
  streamStatus,
  recordStatus,
}: Props) {
  const [showSetup, setShowSetup] = useState(false);

  const setFallbackMutation = useMutation({
    mutationFn: async (sceneName: string) => {
      await apiClient.post(`/events/${eventId}/obs/fallback-scene`, { teamId, sceneName });
    },
    onSuccess: () => setShowSetup(false),
  });

  const triggerFallbackMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/events/${eventId}/obs/fallback-scene/trigger`, { teamId });
    },
  });

  const streamMutation = useMutation({
    mutationFn: async (action: "start" | "stop") => {
      await apiClient.post(`/events/${eventId}/obs/stream/${action}`, { teamId });
    },
  });

  const recordMutation = useMutation({
    mutationFn: async (action: "start" | "stop") => {
      await apiClient.post(`/events/${eventId}/obs/record/${action}`, { teamId });
    },
  });

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
      {fallbackSceneName ? (
        <button
          onClick={() => triggerFallbackMutation.mutate()}
          disabled={triggerFallbackMutation.isPending}
          className="px-5 py-3 rounded-full bg-signal-red text-white text-sm font-bold shadow-lg"
        >
          ⚠ Technical Difficulties
        </button>
      ) : (
        <button
          onClick={() => setShowSetup(true)}
          className="px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-medium border border-white/20"
        >
          Set up fallback scene
        </button>
      )}

      <button
        onClick={() => streamMutation.mutate(streamStatus?.active ? "stop" : "start")}
        disabled={streamMutation.isPending}
        className="px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-medium border border-white/20"
      >
        {streamStatus?.active ? "Stop Stream" : "Start Stream"}
      </button>

      <button
        onClick={() => recordMutation.mutate(recordStatus?.active ? "stop" : "start")}
        disabled={recordMutation.isPending}
        className="px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-medium border border-white/20"
      >
        {recordStatus?.active ? "Stop Recording" : "Start Recording"}
      </button>

      {showSetup && (
        <div className="fixed inset-0 z-50 bg-navy/90 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-sm bg-navy border border-white/15 rounded-2xl p-5">
            <p className="font-display font-semibold mb-1">Set fallback scene</p>
            <p className="text-xs text-surface-light/60 mb-4">
              Build a "Technical Difficulties" scene in OBS first, then select it here. One tap during a live event switches straight to it.
            </p>
            <div className="flex flex-col gap-2 mb-4 max-h-48 overflow-y-auto">
              {scenes.map((scene) => (
                <button
                  key={scene.sceneName}
                  onClick={() => setFallbackMutation.mutate(scene.sceneName)}
                  disabled={setFallbackMutation.isPending}
                  className="px-4 py-2.5 rounded-lg text-sm text-left bg-white/5 text-surface-light/80"
                >
                  {scene.sceneName}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowSetup(false)}
              className="w-full py-2.5 rounded-lg text-sm text-surface-light/60 border border-white/15"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
