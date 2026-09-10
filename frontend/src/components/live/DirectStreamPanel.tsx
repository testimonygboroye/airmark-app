import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/errors";

interface Props {
  eventId: string;
  teamId: string;
}

export function DirectStreamPanel({ eventId, teamId }: Props) {
  const [open, setOpen] = useState(false);
  const [platformLabel, setPlatformLabel] = useState("");
  const [rtmpUrl, setRtmpUrl] = useState("");
  const [streamKey, setStreamKey] = useState("");
  const [pairingToken, setPairingToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: status } = useQuery({
    queryKey: ["directStreamStatus", eventId],
    queryFn: async () => {
      const res = await apiClient.get(`/events/${eventId}/direct-stream/status`);
      return res.data.data as { platformLabel: string; status: string } | null;
    },
    refetchInterval: 5000,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      await apiClient.put(`/events/${eventId}/direct-stream/config`, { teamId, platformLabel, rtmpUrl, streamKey });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const pairMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(`/events/${eventId}/direct-stream/pair`, { teamId });
      return res.data.data.pairingToken as string;
    },
    onSuccess: (token) => setPairingToken(token),
  });

  const startMutation = useMutation({
    mutationFn: async () => { await apiClient.post(`/events/${eventId}/direct-stream/start`, { teamId }); },
  });
  const stopMutation = useMutation({
    mutationFn: async () => { await apiClient.post(`/events/${eventId}/direct-stream/stop`, { teamId }); },
  });

  const btnBase = "text-xs font-medium px-3 py-1.5 rounded-lg border border-standby-slate/30 dark:border-white/15 text-standby-slate dark:text-surface-light/70";

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className={btnBase}>
        Direct Stream {status?.status === "streaming" && "🔴"}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-navy/90 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white dark:bg-navy border border-standby-slate/20 rounded-2xl p-5 max-h-[85vh] overflow-y-auto">
        <p className="font-display font-semibold mb-1">Direct Stream (Basic)</p>
        <p className="text-xs text-standby-slate mb-4">
          Sends one camera feed to any RTMP destination — YouTube, Facebook, Twitch, Telegram, or anywhere else that
          accepts RTMP. No OBS needed, but still requires a laptop with ffmpeg running the bridge.
        </p>

        <div className="flex flex-col gap-2 mb-4">
          <input placeholder="Platform name (e.g. YouTube)" value={platformLabel} onChange={(e) => setPlatformLabel(e.target.value)} className="text-sm rounded-lg px-3 py-2 border border-standby-slate/20 text-navy dark:text-surface-light dark:bg-navy/60" />
          <input placeholder="RTMP URL (e.g. rtmp://a.rtmp.youtube.com/live2)" value={rtmpUrl} onChange={(e) => setRtmpUrl(e.target.value)} className="text-sm rounded-lg px-3 py-2 border border-standby-slate/20 text-navy dark:text-surface-light dark:bg-navy/60" />
          <input placeholder="Stream key" value={streamKey} onChange={(e) => setStreamKey(e.target.value)} className="text-sm rounded-lg px-3 py-2 border border-standby-slate/20 text-navy dark:text-surface-light dark:bg-navy/60" />
          {error && <p className="text-xs text-signal-red">{error}</p>}
          <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !platformLabel || !rtmpUrl || !streamKey} className="text-xs font-semibold py-2 rounded-lg bg-accent-teal text-navy disabled:opacity-50">
            Save destination
          </button>
        </div>

        <div className="flex flex-col gap-2 mb-4 pt-3 border-t border-standby-slate/15">
          <button onClick={() => pairMutation.mutate()} disabled={pairMutation.isPending} className={btnBase}>
            Generate bridge pairing code
          </button>
          {pairingToken && (
            <div className="text-xs bg-standby-slate/10 rounded-lg p-2 break-all font-mono">{pairingToken}</div>
          )}
          <p className="text-xs text-standby-slate">
            Run the bridge on your laptop and paste this code when prompted (expires in 10 minutes).
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-standby-slate/15 mb-4">
          <span className="text-xs text-standby-slate">
            Status: <strong>{status?.status ?? "idle"}</strong>
          </span>
          <div className="flex gap-2">
            <button onClick={() => startMutation.mutate()} disabled={startMutation.isPending} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-signal-red text-white">Start</button>
            <button onClick={() => stopMutation.mutate()} disabled={stopMutation.isPending} className={btnBase}>Stop</button>
          </div>
        </div>

        <button onClick={() => setOpen(false)} className="w-full py-2.5 rounded-lg text-sm text-standby-slate border border-standby-slate/20">Close</button>
      </div>
    </div>
  );
}
