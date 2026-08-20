import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import { apiClient } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/errors";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTeamRole } from "@/hooks/useTeamRole";
import type { EventRecord, CameraAssignmentRecord, TeamMemberEntry } from "@/types";

export function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: { event: EventRecord; cameras: CameraAssignmentRecord[] } }>(
        `/events/${eventId}`
      );
      return res.data.data;
    },
    enabled: !!eventId,
  });

  const { hasPermission } = useTeamRole(data?.event.teamId);

  const { data: members } = useQuery({
    queryKey: ["teamMembers", data?.event.teamId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: TeamMemberEntry[] }>(
        `/teams/${data!.event.teamId}/members`
      );
      return res.data.data;
    },
    enabled: !!data?.event.teamId,
  });

  const assignMutation = useMutation({
    mutationFn: async ({ cameraId, operatorUserId }: { cameraId: string; operatorUserId: string | null }) => {
      await apiClient.patch(`/events/${eventId}/cameras/${cameraId}/assign`, {
        teamId: data!.event.teamId,
        operatorUserId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    },
  });

  if (isLoading || !data) {
    return <div className="max-w-2xl mx-auto px-4 py-8 text-sm text-standby-slate">Loading…</div>;
  }

  const { event, cameras } = data;
  const canManage = hasPermission("event:manage");
  const canGoLive = hasPermission("tally:control");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">{event.title}</h1>
          <p className="text-sm text-standby-slate mt-1">
            {new Date(event.scheduledStart).toLocaleString(undefined, {
              dateStyle: "full",
              timeStyle: "short",
            })}
          </p>
        </div>
        {canGoLive && (
          <Link to={`/events/${event._id}/live`}>
            <Button>Go Live</Button>
          </Link>
        )}
      </div>

      <h2 className="font-display text-sm font-semibold text-standby-slate uppercase tracking-wide mb-3">
        Camera assignments
      </h2>
      <div className="flex flex-col gap-2">
        {cameras.map((camera) => (
          <Card key={camera._id} className="!p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-sm">{camera.label}</p>
              {camera.operatorUserId && (
                <p className="text-xs text-standby-slate mt-0.5">
                  {camera.operatorUserId.firstName} {camera.operatorUserId.lastName}
                </p>
              )}
            </div>
            {canManage && (
              <select
                className="text-sm rounded-lg border border-standby-slate/30 px-3 py-2 bg-white dark:bg-navy/60"
                value={camera.operatorUserId?._id ?? ""}
                onChange={(e) =>
                  assignMutation.mutate({
                    cameraId: camera._id,
                    operatorUserId: e.target.value || null,
                  })
                }
              >
                <option value="">Unassigned</option>
                {members?.map((m) => (
                  <option key={m.userId._id} value={m.userId._id}>
                    {m.userId.firstName} {m.userId.lastName}
                  </option>
                ))}
              </select>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
