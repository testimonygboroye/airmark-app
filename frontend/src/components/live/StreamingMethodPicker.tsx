import { useState, useEffect } from "react";
import { ObsPairingPanel } from "@/components/live/ObsPairingPanel";
import { DirectStreamPanel } from "@/components/live/DirectStreamPanel";
import { AudienceLinkPanel } from "@/components/live/AudienceLinkPanel";
import { ObsSourceLinksPanel } from "@/components/live/ObsSourceLinksPanel";
import type { CameraAssignmentRecord, ObsConnectionRecord } from "@/types";

interface Props {
  eventId: string;
  teamId: string;
  cameras: CameraAssignmentRecord[];
  obsConnection: ObsConnectionRecord;
}

type Category = "direct" | "third-party" | null;

/**
 * Two grouped entry points instead of an ever-growing row of buttons.
 * Both categories' underlying connections can run at the same time
 * (they solve different problems — direct is the always-on coordination
 * layer, third-party is an additive broadcast option) — this picker only
 * controls which one is remembered as "the one currently in focus" for
 * this browser, shown via the highlighted state, not which is "on."
 */
export function StreamingMethodPicker(props: Props) {
  const [openCategory, setOpenCategory] = useState<Category>(null);
  const [activeMethod, setActiveMethod] = useState<string>(() => localStorage.getItem(`airmark-active-method-${props.eventId}`) || "");

  useEffect(() => {
    if (activeMethod) localStorage.setItem(`airmark-active-method-${props.eventId}`, activeMethod);
  }, [activeMethod, props.eventId]);

  const btnBase = "text-xs font-medium px-3 py-1.5 rounded-lg border border-standby-slate/30 dark:border-white/15 text-standby-slate dark:text-surface-light/70";

  function select(method: string) {
    setActiveMethod(method);
  }

  return (
    <div className="flex items-center gap-2 relative">
      <button onClick={() => setOpenCategory(openCategory === "direct" ? null : "direct")} className={btnBase}>
        Direct (no third-party)
      </button>
      <button onClick={() => setOpenCategory(openCategory === "third-party" ? null : "third-party")} className={btnBase}>
        Third-Party
      </button>

      {openCategory && <div className="fixed inset-0 z-40" onClick={() => setOpenCategory(null)} />}

      {openCategory === "direct" && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-navy border border-standby-slate/20 rounded-xl p-3 flex flex-col gap-2 shadow-xl min-w-[220px]">
          <p className="text-[10px] uppercase tracking-wide text-standby-slate mb-1">No installs, no external software</p>
          <div onClick={() => select("audience-link")} className={activeMethod === "audience-link" ? "ring-2 ring-accent-teal rounded-lg" : ""}>
            <AudienceLinkPanel eventId={props.eventId} teamId={props.teamId} />
          </div>
        </div>
      )}

      {openCategory === "third-party" && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-navy border border-standby-slate/20 rounded-xl p-3 flex flex-col gap-2 shadow-xl min-w-[240px]">
          <p className="text-[10px] uppercase tracking-wide text-standby-slate mb-1">Requires OBS or a bridge script on a laptop</p>
          <div onClick={() => select("obs")} className={activeMethod === "obs" ? "ring-2 ring-accent-teal rounded-lg" : ""}>
            <ObsPairingPanel eventId={props.eventId} teamId={props.teamId} connected={props.obsConnection.status === "connected"} />
          </div>
          <div onClick={() => select("direct-stream")} className={activeMethod === "direct-stream" ? "ring-2 ring-accent-teal rounded-lg" : ""}>
            <DirectStreamPanel eventId={props.eventId} teamId={props.teamId} />
          </div>
          <ObsSourceLinksPanel eventId={props.eventId} teamId={props.teamId} cameras={props.cameras} />
        </div>
      )}
    </div>
  );
}
