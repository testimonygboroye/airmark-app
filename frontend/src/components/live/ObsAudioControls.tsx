import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

interface Props {
  eventId: string;
  teamId: string;
}

interface AudioInput {
  inputName: string;
  inputKind: string;
}

export function ObsAudioControls({ eventId, teamId }: Props) {
  const [open, setOpen] = useState(false);

  const { data: inputs } = useQuery({
    queryKey: ["obsAudioSources", eventId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: { inputs: AudioInput[] } }>(
        `/events/${eventId}/obs/audio/sources`
      );
      return res.data.data.inputs.filter((i) =>
        i.inputKind?.toLowerCase().includes("audio") ||
        i.inputKind?.toLowerCase().includes("wasapi") ||
        i.inputKind?.toLowerCase().includes("mic") ||
        i.inputKind?.toLowerCase().includes("input_capture")
      );
    },
    enabled: open,
  });

  const muteMutation = useMutation({
    mutationFn: async ({ inputName, muted }: { inputName: string; muted: boolean }) => {
      await apiClient.patch(`/events/${eventId}/obs/audio/mute`, { teamId, inputName, muted });
    },
  });

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-surface-light/70 font-medium px-3 py-1.5 rounded-lg border border-white/15"
      >
        Audio
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-navy/90 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-navy border border-white/15 rounded-2xl p-5">
        <p className="font-display font-semibold mb-1">Audio sources</p>
        <p className="text-xs text-surface-light/60 mb-4">
          Mute or unmute any audio input currently set up in OBS.
        </p>

        <div className="flex flex-col gap-2 mb-4 max-h-64 overflow-y-auto">
          {!inputs && <p className="text-xs text-surface-light/50">Loading…</p>}
          {inputs?.length === 0 && (
            <p className="text-xs text-surface-light/50">No audio sources found in OBS.</p>
          )}
          {inputs?.map((input) => (
            <div
              key={input.inputName}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/5"
            >
              <span className="text-sm text-surface-light/80 truncate">{input.inputName}</span>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => muteMutation.mutate({ inputName: input.inputName, muted: false })}
                  disabled={muteMutation.isPending}
                  className="text-xs px-2.5 py-1 rounded-md bg-accent-teal/20 text-accent-teal"
                >
                  Unmute
                </button>
                <button
                  onClick={() => muteMutation.mutate({ inputName: input.inputName, muted: true })}
                  disabled={muteMutation.isPending}
                  className="text-xs px-2.5 py-1 rounded-md bg-signal-red/20 text-signal-red"
                >
                  Mute
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setOpen(false)}
          className="w-full py-2.5 rounded-lg text-sm text-surface-light/60 border border-white/15"
        >
          Close
        </button>
      </div>
    </div>
  );
}
