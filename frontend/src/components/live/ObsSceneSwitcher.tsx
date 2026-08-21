import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { ObsSceneRecord } from "@/types";

interface Props {
  eventId: string;
  teamId: string;
  scenes: ObsSceneRecord[];
  currentProgramScene?: string;
}

export function ObsSceneSwitcher({ eventId, teamId, scenes, currentProgramScene }: Props) {
  const setSceneMutation = useMutation({
    mutationFn: async (sceneName: string) => {
      await apiClient.post(`/events/${eventId}/obs/scene`, { teamId, sceneName });
    },
  });

  if (scenes.length === 0) return null;

  return (
    <div className="px-4 py-3 border-t border-white/10">
      <p className="text-[10px] uppercase tracking-wide text-surface-light/50 mb-2">
        OBS Scenes
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {scenes.map((scene) => (
          <button
            key={scene.sceneName}
            onClick={() => setSceneMutation.mutate(scene.sceneName)}
            disabled={setSceneMutation.isPending}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              scene.sceneName === currentProgramScene
                ? "bg-signal-red text-white"
                : "bg-white/5 text-surface-light/80"
            }`}
          >
            {scene.sceneName}
          </button>
        ))}
      </div>
    </div>
  );
}
