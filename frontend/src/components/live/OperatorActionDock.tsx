import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { SignalType, EquipmentIssueType } from "@/types";

interface Props {
  eventId: string;
  teamId: string;
  cameraId?: string;
  inline?: boolean;
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

export function OperatorActionDock({ eventId, teamId, cameraId, inline }: Props) {
  const [openPanel, setOpenPanel] = useState<PanelKey>(null);
  const [markLabel, setMarkLabel] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  function showToast(text: string) {
    setToast(text);
    setTimeout(() => setToast(null), 2500);
  }

  const markMutation = useMutation({
    mutationFn: async (label?: string) => { await apiClient.post(`/events/${eventId}/highlights`, { teamId, label }); },
    onSuccess: () => { setOpenPanel(null); setMarkLabel(""); showToast("✓ Highlight marked"); },
  });
  const signalMutation = useMutation({
    mutationFn: async (type: SignalType) => { await apiClient.post(`/events/${eventId}/signals`, { teamId, type }); },
    onSuccess: (_d, type) => { setOpenPanel(null); showToast(`Sent: ${SIGNAL_OPTIONS.find((s) => s.type === type)?.label}`); },
  });
  const equipmentMutation = useMutation({
    mutationFn: async (issueType: EquipmentIssueType) => { await apiClient.post(`/events/${eventId}/equipment`, { teamId, cameraId, issueType }); },
    onSuccess: () => { setOpenPanel(null); showToast("Equipment issue reported"); },
  });

  return (
    <div className={inline ? "flex items-center gap-2" : "shrink-0 relative bg-navy px-4 py-2.5 flex items-center justify-end gap-2 border-t border-white/10"}>
      {openPanel && <div className="fixed inset-0 z-40" onClick={() => setOpenPanel(null)} />}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg bg-white text-navy dark:bg-navy dark:text-surface-light text-xs font-semibold shadow-lg whitespace-nowrap border border-standby-slate/20">
          {toast}
        </div>
      )}

      {openPanel === "mark" && (
        <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 bg-white dark:bg-navy border border-standby-slate/20 shadow-xl rounded-xl p-3 w-56">
          <input autoFocus placeholder="Label (optional)" value={markLabel} onChange={(e) => setMarkLabel(e.target.value)} maxLength={100} className="text-sm rounded-lg px-3 py-2 border border-standby-slate/20 text-navy dark:text-surface-light dark:bg-navy/60" />
          <button onClick={() => markMutation.mutate(markLabel.trim() || undefined)} disabled={markMutation.isPending} className="text-xs font-semibold py-2 rounded-lg bg-accent-teal text-navy disabled:opacity-50">
            {markMutation.isPending ? "Marking…" : "Mark this moment"}
          </button>
        </div>
      )}
      {openPanel === "equipment" && (
        <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 bg-white dark:bg-navy border border-standby-slate/20 shadow-xl rounded-xl p-2 w-52">
          {EQUIPMENT_OPTIONS.map((opt) => (
            <button key={opt.type} onClick={() => equipmentMutation.mutate(opt.type)} disabled={equipmentMutation.isPending} className="px-3 py-2.5 rounded-lg text-sm text-left text-navy dark:text-surface-light hover:bg-standby-slate/10">
              {opt.label}
            </button>
          ))}
        </div>
      )}
      {openPanel === "signal" && (
        <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 bg-white dark:bg-navy border border-standby-slate/20 shadow-xl rounded-xl p-2 w-52">
          {SIGNAL_OPTIONS.map((opt) => (
            <button key={opt.type} onClick={() => signalMutation.mutate(opt.type)} disabled={signalMutation.isPending} className="px-3 py-2.5 rounded-lg text-sm text-left text-navy dark:text-surface-light hover:bg-standby-slate/10">
              {opt.label}
            </button>
          ))}
        </div>
      )}

      <button onClick={() => setOpenPanel((p) => (p === "mark" ? null : "mark"))} className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center" aria-label="Mark highlight">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 3h12v18l-6-4-6 4V3z" fill="currentColor" /></svg>
      </button>
      <button onClick={() => setOpenPanel((p) => (p === "equipment" ? null : "equipment"))} className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center" aria-label="Report equipment issue">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M18 10v4l3-2-3-2z" fill="currentColor" /></svg>
      </button>
      <button onClick={() => setOpenPanel((p) => (p === "signal" ? null : "signal"))} className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center" aria-label="Send a discreet signal">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2a7 7 0 00-7 7v4l-2 3h18l-2-3V9a7 7 0 00-7-7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M9.5 20a2.5 2.5 0 005 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
      </button>
    </div>
  );
}
