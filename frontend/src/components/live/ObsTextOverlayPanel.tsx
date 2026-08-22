import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { ObsSceneItemRecord } from "@/types";

interface Props {
  eventId: string;
  teamId: string;
  items: ObsSceneItemRecord[];
}

/**
 * Text sources aren't distinguishable from other source types via the
 * scene-item list alone (OBS doesn't expose input kind there), so we let
 * the director pick any source by name — if it's not actually a text
 * source, OBS will simply reject the update, which is safe.
 */
export function ObsTextOverlayPanel({ eventId, teamId, items }: Props) {
  const [selectedSource, setSelectedSource] = useState("");
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);

  const updateMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/events/${eventId}/obs/text`, {
        teamId,
        sourceName: selectedSource,
        text,
      });
    },
    onSuccess: () => setOpen(false),
  });

  if (items.length === 0) return null;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-surface-light/70 font-medium px-3 py-1.5 rounded-lg border border-white/15"
      >
        Edit text overlay
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-navy/90 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-navy border border-white/15 rounded-2xl p-5">
        <p className="font-display font-semibold mb-4">Update text overlay</p>

        <select
          className="w-full text-sm rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 mb-3"
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value)}
        >
          <option value="">Select source…</option>
          {items.map((item) => (
            <option key={item.sceneItemId} value={item.sourceName}>
              {item.sourceName}
            </option>
          ))}
        </select>

        <textarea
          className="w-full text-sm rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 mb-4 resize-none"
          rows={3}
          maxLength={500}
          placeholder="Enter caption, name, title, or verse text…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="flex gap-2">
          <button
            onClick={() => setOpen(false)}
            className="flex-1 py-2.5 rounded-lg text-sm text-surface-light/60 border border-white/15"
          >
            Cancel
          </button>
          <button
            onClick={() => updateMutation.mutate()}
            disabled={!selectedSource || updateMutation.isPending}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-accent-teal text-navy disabled:opacity-40"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
