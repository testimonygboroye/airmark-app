import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

interface Props {
  eventId: string;
}

export function AudienceLinkPanel({ eventId }: Props) {
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(`/events/${eventId}/public-link`);
      return res.data.data.publicShareToken as string;
    },
    onSuccess: (token) => setLink(`${window.location.origin}/watch/${token}`),
  });

  function openPanel() {
    setOpen(true);
    if (!link) fetchMutation.mutate();
  }

  function copyLink() {
    if (!link) return;
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  }

  async function shareLink() {
    if (!link) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Watch live", url: link });
      } catch { /* user cancelled the share sheet — no action needed */ }
    } else {
      copyLink();
    }
  }

  const btnBase = "text-xs font-medium px-3 py-1.5 rounded-lg border border-standby-slate/30 dark:border-white/15 text-standby-slate dark:text-surface-light/70";

  if (!open) {
    return <button onClick={openPanel} className={btnBase}>Audience Link</button>;
  }

  return (
    <div className="fixed inset-0 z-50 bg-navy/90 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white dark:bg-navy border border-standby-slate/20 rounded-2xl p-5">
        <p className="font-display font-semibold mb-1">Audience link</p>
        <p className="text-xs text-standby-slate mb-4">
          Anyone with this link can watch this event's live feed with sound — no Airmark account needed.
        </p>

        {!link ? (
          <p className="text-xs text-standby-slate">Generating link…</p>
        ) : (
          <>
            <div className="text-xs bg-standby-slate/10 rounded-lg p-2 break-all font-mono mb-3">{link}</div>
            <div className="flex gap-2 mb-4">
              <button onClick={copyLink} className="flex-1 text-xs font-semibold py-2 rounded-lg bg-accent-teal text-navy">
                {copied ? "Copied!" : "Copy link"}
              </button>
              <button onClick={shareLink} className="flex-1 text-xs font-semibold py-2 rounded-lg border border-standby-slate/30">
                Share
              </button>
            </div>
          </>
        )}

        <button onClick={() => setOpen(false)} className="w-full py-2.5 rounded-lg text-sm text-standby-slate border border-standby-slate/20">Close</button>
      </div>
    </div>
  );
}
