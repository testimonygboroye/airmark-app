import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import { apiClient } from "@/lib/apiClient";
import { Card } from "@/components/ui/Card";
import type { EventRecord } from "@/types";

export function EditorWorkspacePage() {
  const { teamId } = useParams<{ teamId: string }>();

  const { data: events, isLoading } = useQuery({
    queryKey: ["events", teamId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: EventRecord[] }>("/events", { params: { teamId } });
      return res.data.data;
    },
    enabled: !!teamId,
  });

  const endedEvents = events?.filter((e) => e.status === "ended") ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-semibold mb-1">Post-event review</h1>
      <p className="text-sm text-standby-slate mb-6">
        Events ready for highlight review and clipping.
      </p>

      {isLoading && <p className="text-sm text-standby-slate">Loading…</p>}

      {endedEvents.length === 0 && !isLoading && (
        <Card className="text-center">
          <p className="text-standby-slate text-sm">No completed events yet.</p>
        </Card>
      )}

      <div className="flex flex-col gap-2">
        {endedEvents.map((event) => (
          <Link key={event._id} to={`/events/${event._id}/highlights`}>
            <Card className="!p-4 hover:border-accent-teal/50 transition-colors">
              <p className="font-semibold text-sm">{event.title}</p>
              <p className="text-xs text-standby-slate mt-0.5">
                {new Date(event.scheduledStart).toLocaleDateString(undefined, { dateStyle: "medium" })}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
