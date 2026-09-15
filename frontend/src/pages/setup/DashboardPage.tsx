import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import { apiClient } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/errors";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Membership } from "@/types";

export function DashboardPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error: fetchError } = useQuery({
    queryKey: ["myTeams"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Membership[] }>("/teams/my");
      return res.data.data;
    },
  });

  const leaveTeamMutation = useMutation({
    mutationFn: async (teamId: string) => {
      const res = await apiClient.post<{ message: string; data?: { type: string } }>(`/teams/${teamId}/leave`);
      return res.data;
    },
    onSuccess: (res) => {
      if (res.data?.type === "pending") {
        alert(res.message);
      } else {
        queryClient.invalidateQueries({ queryKey: ["myTeams"] });
      }
    },
    onError: (err) => alert(getErrorMessage(err)),
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold">Your teams</h1>
        <Link to="/teams/new"><Button>+ New team</Button></Link>
      </div>

      {isLoading && <p className="text-sm text-standby-slate">Loading…</p>}
      {fetchError && <p className="text-sm text-signal-red">Couldn't load your teams. Please refresh.</p>}

      {data && data.length === 0 && (
        <Card className="text-center">
          <p className="text-standby-slate mb-4">You're not part of any team yet.</p>
          <Link to="/teams/new"><Button>Create your first team</Button></Link>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {data?.map((m) => {
          const isOwner = m.roleId.name === "Team Owner";
          return (
            <Card key={m._id} className="!p-5">
              <div className="flex items-center justify-between gap-3">
                <Link
                  to={m.roleId.name === "Editor" ? `/teams/${m.teamId._id}/editor` : `/teams/${m.teamId._id}/events`}
                  className="flex-1 min-w-0"
                >
                  <p className="font-semibold truncate">{m.teamId.name}</p>
                  <p className="text-xs text-standby-slate mt-0.5">Your role: {m.roleId.name}</p>
                </Link>
                {!isOwner && (
                  <button
                    onClick={() =>
                      confirm(`Leave "${m.teamId.name}"? If an event is currently live, this will need Director approval first.`) &&
                      leaveTeamMutation.mutate(m.teamId._id)
                    }
                    className="text-xs text-signal-red font-medium shrink-0"
                  >
                    Leave
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
