import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { ObsSceneItemRecord } from "@/types";

interface Props {
  eventId: string;
  teamId: string;
  items: ObsSceneItemRecord[];
}

export function ObsSceneItemsPanel({ eventId, teamId, items }: Props) {
  const toggleMutation = useMutation({
    mutationFn: async ({ sceneItemId, enabled }: { sceneItemId: number; enabled: boolean }) => {
      await apiClient.patch(`/events/${eventId}/obs/scene-items/${sceneItemId}/toggle`, {
        teamId,
        enabled,
      });
    },
  });

  if (items.length === 0) return null;

  return (
    <div className="px-4 py-3 border-t border-white/10">
      <p className="text-[10px] uppercase tracking-wide text-surface-light/50 mb-2">
        Sources in current scene
      </p>
      <div className="flex flex-col gap-1.5">
        {items.map((item) => (
          <div key={item.sceneItemId} className="flex items-center justify-between">
            <span className="text-sm text-surface-light/80">{item.sourceName}</span>
            <button
              onClick={() =>
                toggleMutation.mutate({
                  sceneItemId: item.sceneItemId,
                  enabled: !item.sceneItemEnabled,
                })
              }
              disabled={toggleMutation.isPending}
              className={`w-10 h-6 rounded-full relative transition-colors ${
                item.sceneItemEnabled ? "bg-accent-teal" : "bg-white/10"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  item.sceneItemEnabled ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
