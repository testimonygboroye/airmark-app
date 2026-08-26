import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { ObsSceneItemRecord } from "@/types";

interface Props {
  eventId: string;
  teamId: string;
  items: ObsSceneItemRecord[];
  watermarkSceneItemId?: number;
}

export function ObsWatermarkControls({ eventId, teamId, items, watermarkSceneItemId }: Props) {
  const [showSetup, setShowSetup] = useState(false);

  const setWatermarkMutation = useMutation({
    mutationFn: async (sceneItemId: number) => {
      await apiClient.post(`/events/${eventId}/obs/watermark`, { teamId, sceneItemId });
    },
    onSuccess: () => setShowSetup(false),
  });

  const watermarkItem = items.find((i) => i.sceneItemId === watermarkSceneItemId);

  const toggleMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      await apiClient.patch(`/events/${eventId}/obs/watermark/toggle`, { teamId, enabled });
    },
  });

  if (typeof watermarkSceneItemId !== "number") {
    if (!showSetup) {
      return (
        <button
          onClick={() => setShowSetup(true)}
          className="text-xs text-surface-light/70 font-medium px-3 py-1.5 rounded-lg border border-white/15"
        >
          Set watermark
        </button>
      );
    }
    return (
      <div className="fixed inset-0 z-50 bg-navy/90 backdrop-blur-sm flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-navy border border-white/15 rounded-2xl p-5">
          <p className="font-display font-semibold mb-4">Select watermark source</p>
          <div className="flex flex-col gap-2 mb-4 max-h-48 overflow-y-auto">
            {items.map((item) => (
              <button
                key={item.sceneItemId}
                onClick={() => setWatermarkMutation.mutate(item.sceneItemId)}
                disabled={setWatermarkMutation.isPending}
                className="px-4 py-2.5 rounded-lg text-sm text-left bg-white/5 text-surface-light/80"
              >
                {item.sourceName}
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
    );
  }

  return (
    <button
      onClick={() => toggleMutation.mutate(!watermarkItem?.sceneItemEnabled)}
      disabled={toggleMutation.isPending}
      className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${
        watermarkItem?.sceneItemEnabled
          ? "bg-accent-teal/20 border-accent-teal text-accent-teal"
          : "border-white/15 text-surface-light/60"
      }`}
    >
      Watermark {watermarkItem?.sceneItemEnabled ? "On" : "Off"}
    </button>
  );
}
