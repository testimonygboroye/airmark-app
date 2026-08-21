import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { EquipmentIssueType } from "@/types";

interface Props {
  eventId: string;
  teamId: string;
  cameraId?: string;
}

const OPTIONS: { type: EquipmentIssueType; label: string }[] = [
  { type: "battery_low", label: "Battery low" },
  { type: "storage_full", label: "Storage almost full" },
  { type: "equipment_fault", label: "Equipment fault" },
];

export function EquipmentReportButton({ eventId, teamId, cameraId }: Props) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);

  const reportMutation = useMutation({
    mutationFn: async (issueType: EquipmentIssueType) => {
      await apiClient.post(`/events/${eventId}/equipment`, { teamId, cameraId, issueType });
    },
    onSuccess: () => {
      setOpen(false);
      setSent(true);
      setTimeout(() => setSent(false), 1800);
    },
  });

  return (
    <div className="fixed bottom-24 right-6 z-30 flex flex-col items-end gap-2">
      {sent && (
        <div className="px-3 py-2 rounded-lg bg-white/15 backdrop-blur-sm text-xs font-medium">
          Reported
        </div>
      )}
      {open && (
        <div className="flex flex-col gap-2 mb-1">
          {OPTIONS.map((opt) => (
            <button
              key={opt.type}
              onClick={() => reportMutation.mutate(opt.type)}
              disabled={reportMutation.isPending}
              className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm text-sm font-medium text-right whitespace-nowrap"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Report equipment issue"
        className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="7" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M18 10v4l3-2-3-2z" fill="currentColor" />
          <path d="M6 10v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
