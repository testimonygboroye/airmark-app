import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { SignalType } from "@/types";

interface Props {
  eventId: string;
  teamId: string;
}

const PRESETS: { type: SignalType; label: string }[] = [
  { type: "battery_low", label: "Battery low" },
  { type: "need_backup", label: "Need backup" },
  { type: "audio_issue", label: "Audio issue" },
];

/**
 * Deliberately two-step: a small floating trigger that expands into a
 * short menu, rather than one large tap zone. This is the "always
 * reachable but never accidentally triggerable" requirement — an
 * operator's stray touch during a live event must not fire a false alert.
 */
export function SignalButton({ eventId, teamId }: Props) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  const sendMutation = useMutation({
    mutationFn: async (type: SignalType) => {
      await apiClient.post(`/events/${eventId}/signals`, { teamId, type });
    },
    onSuccess: (_data, type) => {
      setOpen(false);
      const preset = PRESETS.find((p) => p.type === type);
      setSent(preset?.label ?? "Signal sent");
      setTimeout(() => setSent(null), 2000);
    },
  });

  return (
    <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-2">
      {sent && (
        <div className="px-3 py-2 rounded-lg bg-white/15 backdrop-blur-sm text-xs font-medium">
          Sent: {sent}
        </div>
      )}

      {open && (
        <div className="flex flex-col gap-2 mb-1">
          {PRESETS.map((preset) => (
            <button
              key={preset.type}
              onClick={() => sendMutation.mutate(preset.type)}
              disabled={sendMutation.isPending}
              className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm text-sm font-medium text-right whitespace-nowrap"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Send a discreet signal"
        className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2a7 7 0 00-7 7v4l-2 3h18l-2-3V9a7 7 0 00-7-7z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M9.5 20a2.5 2.5 0 005 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
