import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { RunOfShowSegmentRecord } from "@/types";

interface Props {
  eventId: string;
  teamId: string;
  segments: RunOfShowSegmentRecord[];
  currentSegmentId?: string;
}

export function RunOfShowControls({ eventId, teamId, segments, currentSegmentId }: Props) {
  const setCurrentMutation = useMutation({
    mutationFn: async (segmentId: string | null) => {
      await apiClient.patch(`/events/${eventId}/segments/current`, { teamId, segmentId });
    },
  });

  if (segments.length === 0) return null;

  return (
    <div className="px-4 py-3 border-t border-white/10">
      <p className="text-[10px] uppercase tracking-wide text-surface-light/50 mb-2">
        Run of show
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {segments.map((segment) => (
          <button
            key={segment._id}
            onClick={() => setCurrentMutation.mutate(segment._id)}
            disabled={setCurrentMutation.isPending}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              segment._id === currentSegmentId
                ? "bg-accent-teal text-navy"
                : "bg-white/5 text-surface-light/80"
            }`}
          >
            {segment.title}
          </button>
        ))}
      </div>
    </div>
  );
}
