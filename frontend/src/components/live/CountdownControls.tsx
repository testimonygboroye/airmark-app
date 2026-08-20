import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

interface Props {
  eventId: string;
  teamId: string;
  isActive: boolean;
}

export function CountdownControls({ eventId, teamId, isActive }: Props) {
  const [minutes, setMinutes] = useState(5);
  const [open, setOpen] = useState(false);

  const startMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/events/${eventId}/countdown/start`, {
        teamId,
        durationSeconds: minutes * 60,
      });
    },
    onSuccess: () => setOpen(false),
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/events/${eventId}/countdown/cancel`, { teamId });
    },
  });

  if (isActive) {
    return (
      <button
        onClick={() => cancelMutation.mutate()}
        disabled={cancelMutation.isPending}
        className="text-xs text-signal-red font-medium px-3 py-1.5 rounded-lg border border-signal-red/30"
      >
        Cancel countdown
      </button>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-surface-light/70 font-medium px-3 py-1.5 rounded-lg border border-white/15"
      >
        Start countdown
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={1}
        max={60}
        value={minutes}
        onChange={(e) => setMinutes(parseInt(e.target.value, 10) || 1)}
        className="w-14 text-sm text-navy rounded-lg px-2 py-1.5"
      />
      <span className="text-xs text-surface-light/60">min</span>
      <button
        onClick={() => startMutation.mutate()}
        disabled={startMutation.isPending}
        className="text-xs bg-accent-teal text-navy font-semibold px-3 py-1.5 rounded-lg"
      >
        Start
      </button>
      <button
        onClick={() => setOpen(false)}
        className="text-xs text-surface-light/50 px-2"
      >
        Cancel
      </button>
    </div>
  );
}
