import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

interface Props {
  eventId: string;
  teamId: string;
}

export function ObsReplayButton({ eventId, teamId }: Props) {
  const [started, setStarted] = useState(false);
  const [saved, setSaved] = useState(false);

  const startMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/events/${eventId}/obs/replay-buffer/start`, { teamId });
    },
    onSuccess: () => setStarted(true),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/events/${eventId}/obs/replay-buffer/save`, { teamId });
    },
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    },
  });

  useEffect(() => {
    startMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center gap-2">
      {saved && (
        <span className="text-xs text-accent-teal font-medium">Replay saved</span>
      )}
      <button
        onClick={() => saveMutation.mutate()}
        disabled={!started || saveMutation.isPending}
        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-white/15 text-surface-light/70 disabled:opacity-40"
      >
        Save Instant Replay
      </button>
    </div>
  );
}
