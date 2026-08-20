import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import { apiClient } from "@/lib/apiClient";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTeamRole } from "@/hooks/useTeamRole";
import type { EventRecord } from "@/types";

export function EventsListPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const { hasPermission } = useTeamRole(teamId);

  const { data, isLoading } = useQuery({
    queryKey: ["events", teamId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: EventRecord[] }>("/events", {
        params: { teamId },
      });
      return res.data.data;
    },
    enabled: !!teamId,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold">Events</h1>
        {hasPermission("event:create") && (
          <Link to={`/teams/${teamId}/events/new`}>
            <Button>+ New event</Button>
          </Link>
        )}
      </div>

      {isLoading && <p className="text-sm text-standby-slate">Loading…</p>}

      {data && data.length === 0 && (
        <Card className="text-center">
          <p className="text-standby-slate mb-4">No events scheduled yet.</p>
          {hasPermission("event:create") && (
            <Link to={`/teams/${teamId}/events/new`}>
              <Button>Schedule your first event</Button>
            </Link>
          )}
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {data?.map((event) => (
          <Link key={event._id} to={`/events/${event._id}`}>
            <Card className="!p-5 hover:border-accent-teal/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{event.title}</p>
                  <p className="text-xs text-standby-slate mt-0.5">
                    {new Date(event.scheduledStart).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    event.status === "live"
                      ? "bg-signal-red/10 text-signal-red"
                      : event.status === "ended"
                      ? "bg-standby-slate/10 text-standby-slate"
                      : "bg-accent-teal/10 text-accent-teal"
                  }`}
                >
                  {event.status}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
