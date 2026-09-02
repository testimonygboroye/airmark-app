import { useEffect, useState } from "react";

export function useCountdown(targetAt: string | null) {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    if (!targetAt) {
      setRemainingMs(null);
      return;
    }
    const target = new Date(targetAt).getTime();
    function tick() {
      const diff = target - Date.now();
      setRemainingMs(diff > 0 ? diff : 0);
    }
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [targetAt]);

  const isActive = remainingMs !== null && remainingMs > 0;
  const totalSeconds = remainingMs !== null ? Math.ceil(remainingMs / 1000) : 0;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const formatted = h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}` : `${m}:${s.toString().padStart(2, "0")}`;

  return { isActive, totalSeconds, formatted };
}
