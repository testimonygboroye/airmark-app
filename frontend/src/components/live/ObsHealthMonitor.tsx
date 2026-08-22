import type { ObsStreamStatus, ObsRecordStatus } from "@/types";

interface Props {
  streamStatus?: ObsStreamStatus;
  recordStatus?: ObsRecordStatus;
}

export function ObsHealthMonitor({ streamStatus, recordStatus }: Props) {
  if (!streamStatus && !recordStatus) return null;

  const dropRate =
    streamStatus && streamStatus.outputTotalFrames > 0
      ? (streamStatus.outputSkippedFrames / streamStatus.outputTotalFrames) * 100
      : 0;
  const isDroppingFrames = dropRate > 2;

  return (
    <div className="flex items-center gap-3 px-4 py-2 text-xs">
      {streamStatus && (
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              streamStatus.active ? "bg-signal-red" : "bg-standby-slate"
            }`}
          />
          <span className="text-surface-light/70">
            {streamStatus.active ? "Streaming" : "Not streaming"}
          </span>
          {streamStatus.active && isDroppingFrames && (
            <span className="text-signal-red font-semibold ml-1">
              ⚠ {dropRate.toFixed(1)}% frames dropped
            </span>
          )}
        </div>
      )}
      {recordStatus && (
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              recordStatus.active ? "bg-accent-teal" : "bg-standby-slate"
            }`}
          />
          <span className="text-surface-light/70">
            {recordStatus.active ? "Recording" : "Not recording"}
          </span>
        </div>
      )}
    </div>
  );
}
