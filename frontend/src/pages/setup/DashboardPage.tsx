import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { apiClient } from "@/lib/apiClient";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Membership } from "@/types";

export function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["myTeams"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Membership[] }>("/teams/my");
      return res.data.data;
    },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold">Your teams</h1>
        <Link to="/teams/new">
          <Button>+ New team</Button>
        </Link>
      </div>

      {isLoading && <p className="text-sm text-standby-slate">Loading…</p>}
      {error && (
        <p className="text-sm text-signal-red">
          Couldn't load your teams. Please refresh.
        </p>
      )}

      {data && data.length === 0 && (
        <Card className="text-center">
          <p className="text-standby-slate mb-4">
            You're not part of any team yet.
          </p>
          <Link to="/teams/new">
            <Button>Create your first team</Button>
          </Link>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {data?.map((m) => (
          <Link key={m._id} to={`/teams/${m.teamId._id}/events`}>
            <Card className="flex items-center justify-between !p-5 hover:border-accent-teal/50 transition-colors">
              <div>
                <p className="font-semibold">{m.teamId.name}</p>
                <p className="text-xs text-standby-slate mt-0.5">
                  Your role: {m.roleId.name}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
