import { useEffect, useState } from "react";
import type { TalkbackMessageRecord } from "@/types";

interface Props {
  message: TalkbackMessageRecord | null;
}

/**
 * Appears clearly but non-intrusively — a banner that auto-dismisses,
 * not a modal that blocks the operator's view of their own tally state.
 */
export function TalkbackBanner({ message }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 8000);
    return () => clearTimeout(timer);
  }, [message]);

  if (!message || !visible) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 max-w-sm w-[calc(100%-2rem)]">
      <div className="px-4 py-3 rounded-xl bg-accent-teal text-navy shadow-lg flex items-start gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
            Director — {message.fromUserId.firstName}
          </p>
          <p className="text-sm font-medium mt-0.5">{message.text}</p>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="ml-auto text-navy/50 shrink-0"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
