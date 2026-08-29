import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { ObsSceneItemRecord, FavoriteOverlayRecord } from "@/types";

interface Props {
  eventId: string;
  teamId: string;
  items: ObsSceneItemRecord[];
  favorites: FavoriteOverlayRecord[];
}

/**
 * Covers 1G's audience-facing overlay list (QR donation code, social
 * follow prompt, poll, ticker) as director-labeled quick-toggle buttons —
 * built once in OBS as ordinary sources, then favorited here for one-tap
 * access during a live event instead of hunting through the full source list.
 */
export function ObsFavoriteOverlays({ eventId, teamId, items, favorites }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<FavoriteOverlayRecord[]>(favorites);

  const toggleMutation = useMutation({
    mutationFn: async (sceneItemId: number) => {
      const item = items.find((i) => i.sceneItemId === sceneItemId);
      await apiClient.patch(`/events/${eventId}/obs/scene-items/${sceneItemId}/toggle`, {
        teamId,
        enabled: !item?.sceneItemEnabled,
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      await apiClient.put(`/events/${eventId}/obs/favorites`, { teamId, favorites: draft });
    },
    onSuccess: () => setEditing(false),
  });

  function addFavorite(sceneItemId: number, sourceName: string) {
    if (draft.some((f) => f.sceneItemId === sceneItemId)) return;
    setDraft((prev) => [...prev, { label: sourceName, sceneItemId }]);
  }

  function removeFavorite(sceneItemId: number) {
    setDraft((prev) => prev.filter((f) => f.sceneItemId !== sceneItemId));
  }

  if (editing) {
    return (
      <div className="fixed inset-0 z-50 bg-navy/90 backdrop-blur-sm flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-navy border border-white/15 rounded-2xl p-5">
          <p className="font-display font-semibold mb-1">Audience overlay favorites</p>
          <p className="text-xs text-surface-light/60 mb-4">
            Pick sources for one-tap access — e.g. QR donation code, social follow prompt, poll.
          </p>

          <p className="text-[10px] uppercase tracking-wide text-surface-light/40 mb-1.5">Selected</p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {draft.length === 0 && <p className="text-xs text-surface-light/40">None yet</p>}
            {draft.map((f) => (
              <button
                key={f.sceneItemId}
                onClick={() => removeFavorite(f.sceneItemId)}
                className="text-xs px-2.5 py-1 rounded-full bg-accent-teal/20 text-accent-teal"
              >
                {f.label} ✕
              </button>
            ))}
          </div>

          <p className="text-[10px] uppercase tracking-wide text-surface-light/40 mb-1.5">All sources</p>
          <div className="flex flex-col gap-1.5 mb-4 max-h-40 overflow-y-auto">
            {items.map((item) => (
              <button
                key={item.sceneItemId}
                onClick={() => addFavorite(item.sceneItemId, item.sourceName)}
                className="text-xs px-3 py-2 rounded-lg bg-white/5 text-surface-light/70 text-left"
              >
                + {item.sourceName}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setEditing(false)}
              className="flex-1 py-2.5 rounded-lg text-sm text-surface-light/60 border border-white/15"
            >
              Cancel
            </button>
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-accent-teal text-navy"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto">
      <span className="text-[10px] uppercase tracking-wide text-surface-light/50 shrink-0">
        Overlays
      </span>
      {favorites.map((fav) => {
        const item = items.find((i) => i.sceneItemId === fav.sceneItemId);
        return (
          <button
            key={fav.sceneItemId}
            onClick={() => toggleMutation.mutate(fav.sceneItemId)}
            disabled={toggleMutation.isPending}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              item?.sceneItemEnabled ? "bg-accent-teal text-navy" : "bg-white/5 text-surface-light/70"
            }`}
          >
            {fav.label}
          </button>
        );
      })}
      <button
        onClick={() => {
          setDraft(favorites);
          setEditing(true);
        }}
        className="shrink-0 text-xs text-surface-light/50 px-2"
      >
        Edit
      </button>
    </div>
  );
}
