import { useCountdown } from "@/hooks/useCountdown";

interface Props {
  targetAt: string | null;
}

/**
 * Deliberately NOT a full-screen fixed overlay — that previously sat on
 * top of the header and silently captured every tap on the page,
 * including the Pause/Resume/Stop controls. This is a small floating
 * banner instead: visible, unmissable, but everything else stays usable.
 */
export function CountdownOverlay({ targetAt }: Props) {
  const { isActive, formatted } = useCountdown(targetAt);
  if (!isActive) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
      <div className="bg-navy/95 border border-accent-teal/40 rounded-2xl px-6 py-3 shadow-xl text-center">
        <p className="text-[10px] font-medium text-surface-light/60 uppercase tracking-widest mb-0.5">Starting in</p>
        <p className="font-display text-3xl font-bold text-accent-teal tabular-nums">{formatted}</p>
      </div>
    </div>
  );
}
