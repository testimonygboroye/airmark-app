import { useEffect, useState } from "react";

/**
 * Computes remaining seconds locally against a fixed absolute target
 * timestamp, re-checked every 250ms. Since every device does this math
 * independently from the same server-provided timestamp, all phones stay
 * in sync regardless of individual network latency.
 */
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
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return { isActive, totalSeconds, formatted };
}
