import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router";
import { apiClient } from "@/lib/apiClient";
import { Card } from "@/components/ui/Card";
import type { ReadinessEntry, EventRecord } from "@/types";

export function EventReadinessPage() {
  const { eventId } = useParams<{ eventId: string }>();

  const { data: eventData } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: { event: EventRecord } }>(`/events/${eventId}`);
      return res.data.data;
    },
    enabled: !!eventId,
  });

  const { data: readiness, isLoading } = useQuery({
    queryKey: ["readiness", eventId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: ReadinessEntry[] }>(
        `/events/${eventId}/checklist/readiness`,
        { params: { teamId: eventData?.event.teamId } }
      );
      return res.data.data;
    },
    enabled: !!eventId && !!eventData?.event.teamId,
    refetchInterval: 10000,
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Crew readiness</h1>
          <p className="text-sm text-standby-slate mt-1">{eventData?.event.title}</p>
        </div>
        <Link to={`/events/${eventId}`} className="text-xs text-accent-teal font-medium">
          Back
        </Link>
      </div>

      {isLoading && <p className="text-sm text-standby-slate">Loading…</p>}

      {readiness && readiness.length === 0 && (
        <Card className="text-center">
          <p className="text-standby-slate text-sm">
            No checklists configured for any role on this team yet.
          </p>
        </Card>
      )}

      <div className="flex flex-col gap-2">
        {readiness?.map((entry) => {
          const isReady = entry.completedItems === entry.totalItems;
          return (
            <Card key={entry.userId} className="!p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{entry.name}</p>
                <p className="text-xs text-standby-slate mt-0.5">{entry.role}</p>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  isReady
                    ? "bg-accent-teal/10 text-accent-teal"
                    : "bg-signal-red/10 text-signal-red"
                }`}
              >
                {entry.completedItems}/{entry.totalItems} ready
              </span>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
