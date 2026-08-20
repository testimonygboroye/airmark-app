import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { SignalRecord } from "@/types";

interface Props {
  eventId: string;
  teamId: string;
  signals: SignalRecord[];
}

const LABELS: Record<string, string> = {
  battery_low: "Battery low",
  need_backup: "Need backup",
  audio_issue: "Audio issue",
  custom: "Note",
};

export function SignalInbox({ eventId, teamId, signals }: Props) {
  const ackMutation = useMutation({
    mutationFn: async (signalId: string) => {
      await apiClient.patch(`/events/${eventId}/signals/${signalId}/ack`, { teamId });
    },
  });

  const unacknowledged = signals.filter((s) => !s.acknowledged);

  if (unacknowledged.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-30 flex flex-col gap-2 max-w-xs">
      {unacknowledged.map((signal) => (
        <div
          key={signal._id}
          className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-between gap-3"
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">
              {LABELS[signal.type] || signal.type}
            </p>
            <p className="text-xs text-surface-light/60 truncate">
              {signal.fromUserId.firstName} {signal.fromUserId.lastName}
            </p>
          </div>
          <button
            onClick={() => ackMutation.mutate(signal._id)}
            disabled={ackMutation.isPending}
            className="shrink-0 text-xs bg-accent-teal text-navy font-semibold px-3 py-1.5 rounded-lg"
          >
            Ack
          </button>
        </div>
      ))}
    </div>
  );
}
