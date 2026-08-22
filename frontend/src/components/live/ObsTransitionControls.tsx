import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

interface Props {
  eventId: string;
  teamId: string;
  transitions: string[];
  currentTransition?: string;
  transitionDurationMs?: number;
}

export function ObsTransitionControls({
  eventId,
  teamId,
  transitions,
  currentTransition,
  transitionDurationMs,
}: Props) {
  const [duration, setDuration] = useState(transitionDurationMs ?? 300);

  const setTransitionMutation = useMutation({
    mutationFn: async (transitionName: string) => {
      await apiClient.post(`/events/${eventId}/obs/transition`, {
        teamId,
        transitionName,
        transitionDurationMs: duration,
      });
    },
  });

  if (transitions.length === 0) return null;

  return (
    <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto">
      <span className="text-[10px] uppercase tracking-wide text-surface-light/50 shrink-0">
        Transition
      </span>
      {transitions.map((t) => (
        <button
          key={t}
          onClick={() => setTransitionMutation.mutate(t)}
          disabled={setTransitionMutation.isPending}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
            t === currentTransition ? "bg-accent-teal text-navy" : "bg-white/5 text-surface-light/70"
          }`}
        >
          {t}
        </button>
      ))}
      <input
        type="range"
        min={0}
        max={2000}
        step={50}
        value={duration}
        onChange={(e) => setDuration(parseInt(e.target.value, 10))}
        onMouseUp={() => currentTransition && setTransitionMutation.mutate(currentTransition)}
        onTouchEnd={() => currentTransition && setTransitionMutation.mutate(currentTransition)}
        className="w-20 shrink-0"
      />
      <span className="text-[10px] text-surface-light/50 shrink-0">{duration}ms</span>
    </div>
  );
}
