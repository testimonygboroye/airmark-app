import { useCountdown } from "@/hooks/useCountdown";

interface Props {
  targetAt: string | null;
  pausedRemainingMs?: number | null;
}

function formatMs(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}` : `${m}:${s.toString().padStart(2, "0")}`;
}

export function CountdownOverlay({ targetAt, pausedRemainingMs }: Props) {
  const { formatted } = useCountdown(targetAt);
  const isTicking = !!targetAt;
  const isPausedWithTime = !isTicking && typeof pausedRemainingMs === "number" && pausedRemainingMs > 0;

  if (!isTicking && !isPausedWithTime) return null;

  return (
    <div className="shrink-0 flex items-center justify-center py-2 bg-navy/95 border-b border-accent-teal/30">
      <p className="text-[10px] font-medium text-surface-light/60 uppercase tracking-widest mr-2">
        {isPausedWithTime ? "Paused at" : "Starting in"}
      </p>
      <p className="font-display text-lg font-bold text-accent-teal tabular-nums">
        {isTicking ? formatted : formatMs(pausedRemainingMs!)}
      </p>
    </div>
  );
}
