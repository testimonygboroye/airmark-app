import { useCountdown } from "@/hooks/useCountdown";

interface Props {
  targetAt: string | null;
}

/**
 * No longer absolutely/fixed positioned — that was still capable of
 * landing on top of buttons depending on how the header wrapped on
 * narrower screens. This now renders as a normal block in the page's
 * own layout flow, occupying real space rather than floating over
 * anything, guaranteeing it can never overlap another control again.
 */
export function CountdownOverlay({ targetAt }: Props) {
  const { isActive, formatted } = useCountdown(targetAt);
  if (!isActive) return null;

  return (
    <div className="shrink-0 flex items-center justify-center py-2 bg-navy/95 border-b border-accent-teal/30">
      <p className="text-[10px] font-medium text-surface-light/60 uppercase tracking-widest mr-2">Starting in</p>
      <p className="font-display text-lg font-bold text-accent-teal tabular-nums">{formatted}</p>
    </div>
  );
}
