import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { SignalType, EquipmentIssueType } from "@/types";

interface Props {
  eventId: string;
  teamId: string;
  cameraId?: string;
}

type PanelKey = "mark" | "signal" | "equipment" | null;

const SIGNAL_OPTIONS: { type: SignalType; label: string }[] = [
  { type: "battery_low", label: "Battery low" },
  { type: "need_backup", label: "Need backup" },
  { type: "audio_issue", label: "Audio issue" },
];

const EQUIPMENT_OPTIONS: { type: EquipmentIssueType; label: string }[] = [
  { type: "battery_low", label: "Battery low" },
  { type: "storage_full", label: "Storage almost full" },
  { type: "equipment_fault", label: "Equipment fault" },
];

/**
 * A single dock managing three actions with one shared "which panel is
 * open" state — fixes the overlap/non-closing bugs from having three
 * independent floating buttons that didn't know about each other.
 * Opening any panel closes whichever was open; a full-screen backdrop
 * closes on outside tap.
 */
export function OperatorActionDock({ eventId, teamId, cameraId }: Props) {
  const [openPanel, setOpenPanel] = useState<PanelKey>(null);
  const [markLabel, setMarkLabel] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  function showToast(text: string) {
    setToast(text);
    setTimeout(() => setToast(null), 2500);
  }

  const markMutation = useMutation({
    mutationFn: async (label?: string) => {
      await apiClient.post(`/events/${eventId}/highlights`, { teamId, label });
    },
    onSuccess: () => {
      setOpenPanel(null);
      setMarkLabel("");
      showToast("✓ Highlight marked");
    },
  });

  const signalMutation = useMutation({
    mutationFn: async (type: SignalType) => {
      await apiClient.post(`/events/${eventId}/signals`, { teamId, type });
    },
    onSuccess: (_d, type) => {
      setOpenPanel(null);
      showToast(`Sent: ${SIGNAL_OPTIONS.find((s) => s.type === type)?.label}`);
    },
  });

  const equipmentMutation = useMutation({
    mutationFn: async (issueType: EquipmentIssueType) => {
      await apiClient.post(`/events/${eventId}/equipment`, { teamId, cameraId, issueType });
    },
    onSuccess: () => {
      setOpenPanel(null);
      showToast("Equipment issue reported");
    },
  });

  return (
    <>
      {openPanel && (
        <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setOpenPanel(null)} />
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg bg-navy text-surface-light dark:bg-surface-light dark:text-navy text-xs font-semibold shadow-lg whitespace-nowrap">
          {toast}
        </div>
      )}

      <div className="fixed bottom-6 left-0 right-0 z-30 px-6 flex items-end justify-between">
        {/* Mark — bottom left */}
        <div className="relative">
          {openPanel === "mark" && (
            <div className="absolute bottom-full mb-3 left-0 flex flex-col gap-2 bg-white dark:bg-navy border border-standby-slate/20 shadow-xl rounded-xl p-3 w-56">
              <input
                autoFocus
                placeholder="Label (optional)"
                value={markLabel}
                onChange={(e) => setMarkLabel(e.target.value)}
                maxLength={100}
                className="text-sm rounded-lg px-3 py-2 border border-standby-slate/20 text-navy dark:text-surface-light dark:bg-navy/60"
              />
              <button
                onClick={() => markMutation.mutate(markLabel.trim() || undefined)}
                disabled={markMutation.isPending}
                className="text-xs font-semibold py-2 rounded-lg bg-accent-teal text-navy disabled:opacity-50"
              >
                {markMutation.isPending ? "Marking…" : "Mark this moment"}
              </button>
            </div>
          )}
          <button
            onClick={() => setOpenPanel((p) => (p === "mark" ? null : "mark"))}
            className="w-14 h-14 rounded-full bg-white/90 dark:bg-white/10 backdrop-blur-sm border border-standby-slate/20 dark:border-white/20 flex items-center justify-center shadow-lg"
            aria-label="Mark highlight"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 3h12v18l-6-4-6 4V3z" className="fill-navy dark:fill-surface-light" />
            </svg>
          </button>
        </div>

        {/* Signal + Equipment — bottom right, stacked with clear spacing */}
        <div className="flex flex-col items-end gap-3">
          <div className="relative">
            {openPanel === "equipment" && (
              <div className="absolute bottom-full mb-3 right-0 flex flex-col gap-2 bg-white dark:bg-navy border border-standby-slate/20 shadow-xl rounded-xl p-2 w-52">
                {EQUIPMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.type}
                    onClick={() => equipmentMutation.mutate(opt.type)}
                    disabled={equipmentMutation.isPending}
                    className="px-3 py-2.5 rounded-lg text-sm text-left text-navy dark:text-surface-light hover:bg-standby-slate/10"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setOpenPanel((p) => (p === "equipment" ? null : "equipment"))}
              className="w-12 h-12 rounded-full bg-white/90 dark:bg-white/10 backdrop-blur-sm border border-standby-slate/20 dark:border-white/20 flex items-center justify-center shadow-lg"
              aria-label="Report equipment issue"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="7" width="16" height="10" rx="2" className="stroke-navy dark:stroke-surface-light" strokeWidth="1.8" />
                <path d="M18 10v4l3-2-3-2z" className="fill-navy dark:fill-surface-light" />
              </svg>
            </button>
          </div>

          <div className="relative">
            {openPanel === "signal" && (
              <div className="absolute bottom-full mb-3 right-0 flex flex-col gap-2 bg-white dark:bg-navy border border-standby-slate/20 shadow-xl rounded-xl p-2 w-52">
                {SIGNAL_OPTIONS.map((opt) => (
                  <button
                    key={opt.type}
                    onClick={() => signalMutation.mutate(opt.type)}
                    disabled={signalMutation.isPending}
                    className="px-3 py-2.5 rounded-lg text-sm text-left text-navy dark:text-surface-light hover:bg-standby-slate/10"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setOpenPanel((p) => (p === "signal" ? null : "signal"))}
              className="w-14 h-14 rounded-full bg-white/90 dark:bg-white/10 backdrop-blur-sm border border-standby-slate/20 dark:border-white/20 flex items-center justify-center shadow-lg"
              aria-label="Send a discreet signal"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2a7 7 0 00-7 7v4l-2 3h18l-2-3V9a7 7 0 00-7-7z"
                  className="stroke-navy dark:stroke-surface-light"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path d="M9.5 20a2.5 2.5 0 005 0" className="stroke-navy dark:stroke-surface-light" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
