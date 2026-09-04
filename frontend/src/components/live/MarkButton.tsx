import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

interface Props {
  eventId: string;
  teamId: string;
}

export function MarkButton({ eventId, teamId }: Props) {
  const [labelInput, setLabelInput] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const markMutation = useMutation({
    mutationFn: async (label?: string) => { await apiClient.post(`/events/${eventId}/highlights`, { teamId, label }); },
    onSuccess: () => { setShowInput(false); setLabelInput(""); setConfirmed(true); setTimeout(() => setConfirmed(false), 3000); },
  });

  return (
    <>
      {showInput && <div className="fixed inset-0 z-30" onClick={() => setShowInput(false)} />}
      <div className="fixed bottom-20 left-6 z-40">
        {confirmed && (
          <div className="mb-2 px-3 py-2 rounded-lg bg-accent-teal text-navy text-xs font-semibold shadow-lg">
            ✓ Highlight marked
          </div>
        )}

        {showInput ? (
          <div className="flex flex-col gap-2 bg-white dark:bg-navy border border-standby-slate/20 shadow-xl rounded-xl p-3 w-56" onClick={(e) => e.stopPropagation()}>
            <input autoFocus placeholder="Label (optional)" value={labelInput} onChange={(e) => setLabelInput(e.target.value)} maxLength={100} className="text-sm rounded-lg px-3 py-2 border border-standby-slate/20 text-navy dark:text-surface-light dark:bg-navy/60" />
            <div className="flex gap-2">
              <button onClick={() => setShowInput(false)} disabled={markMutation.isPending} className="flex-1 text-xs py-2 rounded-lg text-standby-slate dark:text-surface-light/60 border border-standby-slate/20 dark:border-white/15">Cancel</button>
              <button onClick={() => markMutation.mutate(labelInput.trim() || undefined)} disabled={markMutation.isPending} className="flex-1 text-xs font-semibold py-2 rounded-lg bg-accent-teal text-navy disabled:opacity-50">
                {markMutation.isPending ? "Marking…" : "Mark"}
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowInput(true)} disabled={confirmed} className="px-5 py-3 rounded-full bg-white dark:bg-white/10 border border-standby-slate/20 dark:border-white/20 shadow-lg text-sm font-semibold text-navy dark:text-surface-light flex items-center gap-2 disabled:opacity-60">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 3h12v18l-6-4-6 4V3z" fill="currentColor" /></svg>
            {confirmed ? "Marked" : "Mark"}
          </button>
        )}
      </div>
    </>
  );
}
