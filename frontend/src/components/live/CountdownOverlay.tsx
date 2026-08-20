import { useCountdown } from "@/hooks/useCountdown";

interface Props {
  targetAt: string | null;
}

export function CountdownOverlay({ targetAt }: Props) {
  const { isActive, formatted } = useCountdown(targetAt);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-40 bg-navy/95 backdrop-blur-sm flex flex-col items-center justify-center">
      <p className="text-sm font-medium text-surface-light/60 uppercase tracking-widest mb-4">
        Starting in
      </p>
      <p className="font-display text-7xl font-bold text-accent-teal tabular-nums">
        {formatted}
      </p>
    </div>
  );
}
