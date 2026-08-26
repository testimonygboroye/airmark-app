import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { ObsSceneItemRecord } from "@/types";

interface Props {
  eventId: string;
  teamId: string;
  items: ObsSceneItemRecord[];
  countdownActive: boolean;
}

/**
 * Pushes the countdown onto the actual broadcast output (via the bridge's
 * local timer writing to an OBS text source), separate from the in-app
 * countdown every phone already shows — this is the audience-facing copy.
 */
export function ObsCountdownOverlayControls({ eventId, teamId, items, countdownActive }: Props) {
  const [selectedSource, setSelectedSource] = useState("");
  const [open, setOpen] = useState(false);
  const [pushed, setPushed] = useState(false);

  const startMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/events/${eventId}/obs/countdown-overlay/start`, {
        teamId,
        sourceName: selectedSource,
      });
    },
    onSuccess: () => {
      setOpen(false);
      setPushed(true);
    },
  });

  const stopMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/events/${eventId}/obs/countdown-overlay/stop`, { teamId });
    },
    onSuccess: () => setPushed(false),
  });

  if (!countdownActive && !pushed) return null;

  if (pushed) {
    return (
      <button
        onClick={() => stopMutation.mutate()}
        disabled={stopMutation.isPending}
        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-accent-teal/20 border border-accent-teal text-accent-teal"
      >
        Countdown on broadcast — Stop
      </button>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-surface-light/70 font-medium px-3 py-1.5 rounded-lg border border-white/15"
      >
        Push countdown to broadcast
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-navy/90 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-navy border border-white/15 rounded-2xl p-5">
        <p className="font-display font-semibold mb-2">Push countdown to broadcast</p>
        <p className="text-xs text-surface-light/60 mb-4">
          Select the text source in OBS where the countdown should appear on the actual stream.
        </p>
        <div className="flex flex-col gap-2 mb-4 max-h-48 overflow-y-auto">
          {items.map((item) => (
            <button
              key={item.sceneItemId}
              onClick={() => setSelectedSource(item.sourceName)}
              className={`px-4 py-2.5 rounded-lg text-sm text-left ${
                selectedSource === item.sourceName ? "bg-accent-teal text-navy" : "bg-white/5 text-surface-light/80"
              }`}
            >
              {item.sourceName}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setOpen(false)}
            className="flex-1 py-2.5 rounded-lg text-sm text-surface-light/60 border border-white/15"
          >
            Cancel
          </button>
          <button
            onClick={() => startMutation.mutate()}
            disabled={!selectedSource || startMutation.isPending}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-accent-teal text-navy disabled:opacity-40"
          >
            Push
          </button>
        </div>
      </div>
    </div>
  );
}
