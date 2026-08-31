import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { MyInviteRecord } from "@/types";

export function MyInvitesPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["myInvites"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: MyInviteRecord[] }>("/invites/mine/list");
      return res.data.data;
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      await apiClient.post(`/invites/${inviteId}/accept`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myInvites"] });
      queryClient.invalidateQueries({ queryKey: ["myTeams"] });
    },
  });

  const declineMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      await apiClient.post(`/invites/${inviteId}/decline`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["myInvites"] }),
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-semibold mb-6">Team invites</h1>

      {isLoading && <p className="text-sm text-standby-slate">Loading…</p>}

      {data && data.length === 0 && (
        <Card className="text-center">
          <p className="text-standby-slate text-sm">No pending invites.</p>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {data?.map((invite) => (
          <Card key={invite._id} className="!p-4">
            <p className="font-semibold text-sm">{invite.teamId.name}</p>
            <p className="text-xs text-standby-slate mt-0.5">
              Invited by {invite.invitedBy.firstName} {invite.invitedBy.lastName} as {invite.roleId.name}
            </p>
            <div className="flex gap-2 mt-3">
              <Button onClick={() => acceptMutation.mutate(invite._id)} isLoading={acceptMutation.isPending} className="flex-1">
                Accept
              </Button>
              <Button
                variant="ghost"
                onClick={() => declineMutation.mutate(invite._id)}
                isLoading={declineMutation.isPending}
                className="flex-1"
              >
                Decline
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
