import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

interface Props {
  eventId: string;
  teamId: string;
  isActive: boolean;
  isPaused: boolean;
}

export function CountdownControls({ eventId, teamId, isActive, isPaused }: Props) {
  const queryClient = useQueryClient();
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  function refetch() {
    queryClient.invalidateQueries({ queryKey: ["eventLive", eventId] });
  }

  const startMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/events/${eventId}/countdown/start`, { teamId, durationSeconds: totalSeconds });
    },
    onSuccess: () => {
      setOpen(false);
      refetch(); // fallback in case the socket broadcast is ever missed
    },
    onError: () => setError("Couldn't start countdown"),
  });

  const pauseMutation = useMutation({
    mutationFn: async () => { await apiClient.post(`/events/${eventId}/countdown/pause`, { teamId }); },
    onSuccess: refetch,
  });
  const resumeMutation = useMutation({
    mutationFn: async () => { await apiClient.post(`/events/${eventId}/countdown/resume`, { teamId }); },
    onSuccess: refetch,
  });
  // Stops a countdown that is currently running or paused.
  const cancelRunningMutation = useMutation({
    mutationFn: async () => { await apiClient.post(`/events/${eventId}/countdown/cancel`, { teamId }); },
    onSuccess: refetch,
  });

  const btnBase = "text-xs font-medium px-3 py-1.5 rounded-lg border border-standby-slate/30 dark:border-white/15 text-standby-slate dark:text-surface-light/70";

  if (isPaused) {
    return (
      <div className="flex items-center gap-1.5">
        <button onClick={() => resumeMutation.mutate()} disabled={resumeMutation.isPending} className="text-xs bg-accent-teal text-navy font-semibold px-3 py-1.5 rounded-lg">Resume</button>
        <button onClick={() => cancelRunningMutation.mutate()} disabled={cancelRunningMutation.isPending} className="text-xs text-signal-red font-medium px-3 py-1.5 rounded-lg border border-signal-red/30">Stop countdown</button>
      </div>
    );
  }

  if (isActive) {
    return (
      <div className="flex items-center gap-1.5">
        <button onClick={() => pauseMutation.mutate()} disabled={pauseMutation.isPending} className="text-xs bg-accent-teal text-navy font-semibold px-3 py-1.5 rounded-lg">Pause</button>
        <button onClick={() => cancelRunningMutation.mutate()} disabled={cancelRunningMutation.isPending} className="text-xs text-signal-red font-medium px-3 py-1.5 rounded-lg border border-signal-red/30">Stop countdown</button>
      </div>
    );
  }

  if (!open) {
    return <button onClick={() => setOpen(true)} className={btnBase}>Start countdown</button>;
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <input type="number" min={0} max={23} value={hours} onChange={(e) => setHours(Math.max(0, parseInt(e.target.value, 10) || 0))} className="w-12 text-sm text-navy rounded-lg px-1.5 py-1.5 text-center" />
      <span className="text-xs text-standby-slate">h</span>
      <input type="number" min={0} max={59} value={minutes} onChange={(e) => setMinutes(Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0)))} className="w-12 text-sm text-navy rounded-lg px-1.5 py-1.5 text-center" />
      <span className="text-xs text-standby-slate">m</span>
      <input type="number" min={0} max={59} value={seconds} onChange={(e) => setSeconds(Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0)))} className="w-12 text-sm text-navy rounded-lg px-1.5 py-1.5 text-center" />
      <span className="text-xs text-standby-slate">s</span>
      <button onClick={() => (totalSeconds < 5 ? setError("Must be at least 5 seconds") : startMutation.mutate())} disabled={startMutation.isPending} className="text-xs bg-accent-teal text-navy font-semibold px-3 py-1.5 rounded-lg">
        {startMutation.isPending ? "Starting…" : "Start"}
      </button>
      {/* Closes this setup box without starting anything — distinct from "Stop countdown" above, which stops an already-running one. */}
      <button onClick={() => setOpen(false)} className="text-xs text-standby-slate px-2">Close</button>
      {error && <p className="text-xs text-signal-red w-full">{error}</p>}
    </div>
  );
}
