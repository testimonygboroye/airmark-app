import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams, useNavigate } from "react-router";
import { apiClient } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/errors";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTeamRole } from "@/hooks/useTeamRole";
import type { EventRecord, CameraAssignmentRecord, TeamMemberEntry } from "@/types";

export function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: { event: EventRecord; cameras: CameraAssignmentRecord[] } }>(`/events/${eventId}`);
      return res.data.data;
    },
    enabled: !!eventId,
  });

  const { hasPermission } = useTeamRole(data?.event.teamId);

  const { data: members } = useQuery({
    queryKey: ["teamMembers", data?.event.teamId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: TeamMemberEntry[] }>(`/teams/${data!.event.teamId}/members`);
      return res.data.data;
    },
    enabled: !!data?.event.teamId,
  });

  const assignMutation = useMutation({
    mutationFn: async ({ cameraId, operatorUserId }: { cameraId: string; operatorUserId: string | null }) => {
      await apiClient.patch(`/events/${eventId}/cameras/${cameraId}/assign`, { teamId: data!.event.teamId, operatorUserId });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["event", eventId] }),
  });

  const addCameraMutation = useMutation({
    mutationFn: async () => { await apiClient.post(`/events/${eventId}/cameras`, { teamId: data!.event.teamId }); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["event", eventId] }),
  });

  const removeCameraMutation = useMutation({
    mutationFn: async (cameraId: string) => { await apiClient.delete(`/events/${eventId}/cameras/${cameraId}`, { data: { teamId: data!.event.teamId } }); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["event", eventId] }),
    onError: (err) => alert(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => { await apiClient.delete(`/events/${eventId}`); },
    onSuccess: () => navigate(`/teams/${data?.event.teamId}/events`),
  });

  const reopenMutation = useMutation({
    mutationFn: async () => { await apiClient.post(`/events/${eventId}/reopen`, { teamId: data!.event.teamId }); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["event", eventId] }),
  });

  if (isLoading || !data) {
    return <div className="max-w-2xl mx-auto px-4 py-8 text-sm text-standby-slate">Loading…</div>;
  }

  const { event, cameras } = data;
  const canManage = hasPermission("event:manage");
  const canGoLive = hasPermission("tally:control");
  const canViewLive = hasPermission("tally:view");
  const canManageRos = hasPermission("ros:manage");
  const canViewHighlights = hasPermission("highlight:view");
  const canViewEquipment = hasPermission("equipment:manage");
  const canCompleteChecklist = hasPermission("checklist:complete");
  const canViewReadiness = hasPermission("checklist:manage");
  const isViewerOnly = !canManage && !canGoLive && !canManageRos;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">{event.title}</h1>
          <p className="text-sm text-standby-slate mt-1">
            {new Date(event.scheduledStart).toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${event.status === "live" ? "bg-signal-red/10 text-signal-red" : event.status === "ended" ? "bg-standby-slate/10 text-standby-slate" : "bg-accent-teal/10 text-accent-teal"}`}>
              {event.status}
            </span>
            {event.status === "ended" && canManage && (
              <button onClick={() => reopenMutation.mutate()} className="text-xs text-accent-teal font-medium">Reopen as live</button>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <div className="flex gap-2 flex-wrap justify-end">
            {canManage && <Link to={`/events/${event._id}/edit`}><Button variant="ghost">Edit</Button></Link>}
            {canManageRos && <Link to={`/events/${event._id}/run-of-show`}><Button variant="secondary">Run of show</Button></Link>}
            {(canGoLive || canViewLive) && <Link to={`/events/${event._id}/live`}><Button>{canGoLive ? "Go Live" : "View Live"}</Button></Link>}
            {isViewerOnly && <Link to={`/events/${event._id}/audience-view`}><Button variant="secondary">Watch as Audience</Button></Link>}
          </div>
          <div className="flex flex-wrap gap-3 justify-end">
            {canCompleteChecklist && <Link to={`/events/${event._id}/checklist`} className="text-xs text-accent-teal font-medium">My checklist</Link>}
            {canViewReadiness && <Link to={`/events/${event._id}/readiness`} className="text-xs text-accent-teal font-medium">Crew readiness</Link>}
            {canViewHighlights && <Link to={`/events/${event._id}/highlights`} className="text-xs text-accent-teal font-medium">View highlights</Link>}
            {canViewEquipment && <Link to={`/events/${event._id}/equipment`} className="text-xs text-accent-teal font-medium">Equipment status</Link>}
            {canManage && event.status !== "live" && (
              <button onClick={() => confirm("Delete this event? This cannot be undone.") && deleteMutation.mutate()} className="text-xs text-signal-red font-medium">
                Delete event
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-sm font-semibold text-standby-slate uppercase tracking-wide">Camera assignments</h2>
        {canManage && <button onClick={() => addCameraMutation.mutate()} className="text-xs text-accent-teal font-medium">+ Add camera</button>}
      </div>

      <div className="flex flex-col gap-2">
        {cameras.map((camera) => (
          <Card key={camera._id} className="!p-4">
            <div className="flex flex-col gap-1 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm">{camera.label}</p>
                {camera.isLive && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-signal-red text-white shrink-0">LIVE</span>}
              </div>
              {camera.operatorUserId && (
                <p className="text-xs text-standby-slate truncate">{camera.operatorUserId.firstName} {camera.operatorUserId.lastName}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {canManage && (
                <select
                  className="flex-1 min-w-0 text-sm rounded-lg border border-standby-slate/30 px-3 py-2 bg-white dark:bg-navy/60"
                  value={camera.operatorUserId?._id ?? ""}
                  onChange={(e) => assignMutation.mutate({ cameraId: camera._id, operatorUserId: e.target.value || null })}
                >
                  <option value="">Unassigned</option>
                  {members?.map((m) => (
                    <option key={m.userId._id} value={m.userId._id}>{m.userId.firstName} {m.userId.lastName}</option>
                  ))}
                </select>
              )}
              {canManage && cameras.length > 1 && (
                <button onClick={() => confirm(`Remove ${camera.label}?`) && removeCameraMutation.mutate(camera._id)} className="text-xs text-signal-red font-medium shrink-0">
                  Remove
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
