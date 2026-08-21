import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router";
import { apiClient } from "@/lib/apiClient";
import { Card } from "@/components/ui/Card";
import { formatOffset } from "@/types";
import type { HighlightMarkerRecord, EventRecord } from "@/types";

export function HighlightsPage() {
  const { eventId } = useParams<{ eventId: string }>();

  const { data: eventData } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: { event: EventRecord } }>(`/events/${eventId}`);
      return res.data.data;
    },
    enabled: !!eventId,
  });

  const { data: markers, isLoading } = useQuery({
    queryKey: ["highlights", eventId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: HighlightMarkerRecord[] }>(
        `/events/${eventId}/highlights`
      );
      return res.data.data;
    },
    enabled: !!eventId,
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Highlights</h1>
          <p className="text-sm text-standby-slate mt-1">{eventData?.event.title}</p>
        </div>
        <Link to={`/events/${eventId}`} className="text-xs text-accent-teal font-medium">
          Back to event
        </Link>
      </div>

      {isLoading && <p className="text-sm text-standby-slate">Loading…</p>}

      {markers && markers.length === 0 && (
        <Card className="text-center">
          <p className="text-standby-slate">No highlights marked for this event.</p>
        </Card>
      )}

      <div className="flex flex-col gap-2">
        {markers?.map((marker) => (
          <Card key={marker._id} className="!p-4 flex items-center gap-4">
            <div className="font-display font-bold text-lg text-accent-teal tabular-nums shrink-0 w-16">
              {formatOffset(marker.offsetSeconds)}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">
                {marker.label || "Untitled moment"}
              </p>
              <p className="text-xs text-standby-slate mt-0.5">
                {marker.createdBy.firstName} {marker.createdBy.lastName}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
