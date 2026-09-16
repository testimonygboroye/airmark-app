import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { CameraAssignmentRecord } from "@/types";

interface Props {
  eventId: string;
  teamId: string;
  cameras: CameraAssignmentRecord[];
}

export function ObsSourceLinksPanel({ eventId, teamId, cameras }: Props) {
  const [open, setOpen] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [copiedFor, setCopiedFor] = useState<string | null>(null);

  const fetchMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(`/events/${eventId}/public-link`, { teamId });
      return res.data.data.publicShareToken as string;
    },
    onSuccess: (token) => setShareToken(token),
  });

  function openPanel() {
    setOpen(true);
    if (!shareToken) fetchMutation.mutate();
  }

  function copyLink(operatorUserId: string, label: string) {
    if (!shareToken) return;
    const link = `${window.location.origin}/obs-source/${shareToken}/${operatorUserId}`;
    navigator.clipboard?.writeText(link);
    setCopiedFor(label);
    setTimeout(() => setCopiedFor(null), 1000);
  }

  const assignedCameras = cameras.filter((c) => c.operatorUserId);
  const btnBase = "text-xs font-medium px-3 py-1.5 rounded-lg border border-standby-slate/30 dark:border-white/15 text-standby-slate dark:text-surface-light/70";

  if (!open) return <button onClick={openPanel} className={btnBase}>Operator → OBS Links</button>;

  return (
    <div className="fixed inset-0 z-50 bg-navy/90 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white dark:bg-navy border border-standby-slate/20 rounded-2xl p-5 max-h-[85vh] overflow-y-auto">
        <p className="font-display font-semibold mb-1">Operator phone → OBS source</p>
        <p className="text-xs text-standby-slate mb-4">
          In OBS: Sources → "+" → "Browser" → paste one of these links → set Width/Height to match your canvas.
          The operator's live phone camera then appears as a real OBS source — no plugin needed.
        </p>

        {!shareToken && <p className="text-xs text-standby-slate">Preparing links…</p>}

        <div className="flex flex-col gap-2">
          {shareToken && assignedCameras.map((c) => (
            <div key={c._id} className="flex items-center justify-between gap-2 bg-standby-slate/10 rounded-lg px-3 py-2">
              <span className="text-xs text-navy dark:text-surface-light truncate">{c.label} — {c.operatorUserId?.firstName}</span>
              <button onClick={() => copyLink(c.operatorUserId!._id, c.label)} className="text-xs font-semibold text-accent-teal shrink-0">
                {copiedFor === c.label ? "Copied!" : "Copy"}
              </button>
            </div>
          ))}
          {shareToken && assignedCameras.length === 0 && <p className="text-xs text-standby-slate">No cameras have an operator assigned yet.</p>}
        </div>

        <button onClick={() => setOpen(false)} className="w-full mt-4 py-2.5 rounded-lg text-sm text-standby-slate border border-standby-slate/20">Close</button>
      </div>
    </div>
  );
}
