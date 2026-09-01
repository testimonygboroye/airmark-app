import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

interface Props {
  eventId: string;
  teamId: string;
  isActive: boolean;
}

export function CountdownControls({ eventId, teamId, isActive }: Props) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  const startMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/events/${eventId}/countdown/start`, { teamId, durationSeconds: totalSeconds });
    },
    onSuccess: () => setOpen(false),
    onError: () => setError("Couldn't start countdown"),
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
        className="text-xs text-standby-slate dark:text-surface-light/70 font-medium px-3 py-1.5 rounded-lg border border-standby-slate/20 dark:border-white/15"
      >
        Start countdown
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <input
        type="number"
        min={0}
        max={23}
        value={hours}
        onChange={(e) => setHours(Math.max(0, parseInt(e.target.value, 10) || 0))}
        className="w-12 text-sm text-navy rounded-lg px-1.5 py-1.5 text-center"
      />
      <span className="text-xs text-standby-slate">h</span>
      <input
        type="number"
        min={0}
        max={59}
        value={minutes}
        onChange={(e) => setMinutes(Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0)))}
        className="w-12 text-sm text-navy rounded-lg px-1.5 py-1.5 text-center"
      />
      <span className="text-xs text-standby-slate">m</span>
      <input
        type="number"
        min={0}
        max={59}
        value={seconds}
        onChange={(e) => setSeconds(Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0)))}
        className="w-12 text-sm text-navy rounded-lg px-1.5 py-1.5 text-center"
      />
      <span className="text-xs text-standby-slate">s</span>
      <button
        onClick={() => (totalSeconds < 5 ? setError("Must be at least 5 seconds") : startMutation.mutate())}
        disabled={startMutation.isPending}
        className="text-xs bg-accent-teal text-navy font-semibold px-3 py-1.5 rounded-lg"
      >
        Start
      </button>
      <button onClick={() => setOpen(false)} className="text-xs text-standby-slate px-2">
        Cancel
      </button>
      {error && <p className="text-xs text-signal-red w-full">{error}</p>}
    </div>
  );
}
