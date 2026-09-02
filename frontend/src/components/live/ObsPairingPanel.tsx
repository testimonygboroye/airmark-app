import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

interface Props {
  eventId: string;
  teamId: string;
  connected: boolean;
}

export function ObsPairingPanel({ eventId, teamId, connected }: Props) {
  const [open, setOpen] = useState(false);
  const [pairingToken, setPairingToken] = useState<string | null>(null);

  const pairMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post<{ data: { pairingToken: string } }>(
        `/events/${eventId}/obs/pair`,
        { teamId }
      );
      return res.data.data.pairingToken;
    },
    onSuccess: (token) => setPairingToken(token),
  });

  if (connected) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-accent-teal">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-teal" />
        OBS Connected
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-standby-slate dark:text-surface-light/70 font-medium px-3 py-1.5 rounded-lg border border-standby-slate/30 dark:border-white/15"
      >
        Connect OBS
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-navy/90 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-navy border border-standby-slate/30 dark:border-white/15 rounded-2xl p-5">
        <p className="font-display font-semibold mb-2">Connect OBS Studio</p>
        <p className="text-xs text-surface-light/60 mb-4">
          On the laptop running OBS, run the Airmark bridge script and paste this code when prompted. Valid for 10 minutes.
        </p>

        {pairingToken ? (
          <div className="mb-4">
            <div className="bg-white/5 rounded-lg p-3 break-all font-mono text-xs text-accent-teal select-all">
              {pairingToken}
            </div>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(pairingToken);
              }}
              className="mt-2 text-xs text-accent-teal font-medium"
            >
              Copy code
            </button>
          </div>
        ) : (
          <button
            onClick={() => pairMutation.mutate()}
            disabled={pairMutation.isPending}
            className="w-full py-2.5 rounded-lg text-sm font-semibold bg-accent-teal text-navy mb-4"
          >
            Generate pairing code
          </button>
        )}

        <button
          onClick={() => {
            setOpen(false);
            setPairingToken(null);
          }}
          className="w-full py-2.5 rounded-lg text-sm text-surface-light/60 border border-standby-slate/30 dark:border-white/15"
        >
          Close
        </button>
      </div>
    </div>
  );
}
