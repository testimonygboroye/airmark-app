import type { RunOfShowSegmentRecord } from "@/types";

interface Props {
  currentSegment: RunOfShowSegmentRecord | null;
  nextSegment: RunOfShowSegmentRecord | null;
}

export function SegmentBanner({ currentSegment, nextSegment }: Props) {
  if (!currentSegment && !nextSegment) return null;

  return (
    <div className="px-4 py-3 bg-white/5 backdrop-blur-sm border-b border-white/10 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-surface-light/50">Now</p>
        <p className="font-display font-semibold text-sm truncate">
          {currentSegment?.title ?? "—"}
        </p>
      </div>
      {nextSegment && (
        <div className="min-w-0 text-right">
          <p className="text-[10px] uppercase tracking-wide text-surface-light/50">Next</p>
          <p className="text-sm text-surface-light/70 truncate">{nextSegment.title}</p>
        </div>
      )}
    </div>
  );
}
