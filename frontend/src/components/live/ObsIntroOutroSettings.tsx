import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { ObsSceneRecord } from "@/types";

interface Props {
  eventId: string;
  teamId: string;
  scenes: ObsSceneRecord[];
  introSceneName?: string;
  introDurationSeconds?: number;
  outroSceneName?: string;
  outroDurationSeconds?: number;
}

/** 1H — auto-plays a designated intro scene at stream start, outro at stream stop, no manual timing needed. */
export function ObsIntroOutroSettings({
  eventId,
  teamId,
  scenes,
  introSceneName,
  introDurationSeconds,
  outroSceneName,
  outroDurationSeconds,
}: Props) {
  const [open, setOpen] = useState(false);
  const [intro, setIntro] = useState(introSceneName ?? "");
  const [introSec, setIntroSec] = useState(introDurationSeconds ?? 8);
  const [outro, setOutro] = useState(outroSceneName ?? "");
  const [outroSec, setOutroSec] = useState(outroDurationSeconds ?? 8);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await apiClient.put(`/events/${eventId}/obs/intro-outro`, {
        teamId,
        introSceneName: intro || undefined,
        introDurationSeconds: introSec,
        outroSceneName: outro || undefined,
        outroDurationSeconds: outroSec,
      });
    },
    onSuccess: () => setOpen(false),
  });

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-surface-light/70 font-medium px-3 py-1.5 rounded-lg border border-white/15"
      >
        Intro/Outro
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-navy/90 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-navy border border-white/15 rounded-2xl p-5">
        <p className="font-display font-semibold mb-4">Intro / Outro scenes</p>

        <p className="text-xs text-surface-light/60 mb-1.5">Intro scene (shown when stream starts)</p>
        <select
          className="w-full text-sm rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 mb-2"
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
        >
          <option value="">None</option>
          {scenes.map((s) => (
            <option key={s.sceneName} value={s.sceneName}>
              {s.sceneName}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          max={60}
          value={introSec}
          onChange={(e) => setIntroSec(parseInt(e.target.value, 10) || 8)}
          className="w-full text-sm rounded-lg border border-white/15 bg-white/5 px-3 py-2 mb-4"
          placeholder="Seconds before switching to main scene"
        />

        <p className="text-xs text-surface-light/60 mb-1.5">Outro scene (shown before stream stops)</p>
        <select
          className="w-full text-sm rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 mb-2"
          value={outro}
          onChange={(e) => setOutro(e.target.value)}
        >
          <option value="">None</option>
          {scenes.map((s) => (
            <option key={s.sceneName} value={s.sceneName}>
              {s.sceneName}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          max={60}
          value={outroSec}
          onChange={(e) => setOutroSec(parseInt(e.target.value, 10) || 8)}
          className="w-full text-sm rounded-lg border border-white/15 bg-white/5 px-3 py-2 mb-4"
          placeholder="Seconds before stream stops"
        />

        <div className="flex gap-2">
          <button
            onClick={() => setOpen(false)}
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
