import { useState } from "react";
import { useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/errors";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useTeamRole } from "@/hooks/useTeamRole";
import type { ScheduleAssignmentRecord, TeamMemberEntry } from "@/types";

export function SchedulePage() {
  const { teamId } = useParams<{ teamId: string }>();
  const queryClient = useQueryClient();
  const { hasPermission } = useTeamRole(teamId);
  const canManage = hasPermission("schedule:manage");

  const [userId, setUserId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: members } = useQuery({
    queryKey: ["teamMembers", teamId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: TeamMemberEntry[] }>(`/teams/${teamId}/members`);
      return res.data.data;
    },
    enabled: !!teamId,
  });

  const { data: schedule, isLoading } = useQuery({
    queryKey: ["schedule", teamId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: ScheduleAssignmentRecord[] }>("/schedule", {
        params: { teamId },
      });
      return res.data.data;
    },
    enabled: !!teamId,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post("/schedule", {
        teamId,
        userId,
        roleId,
        date: new Date(date).toISOString(),
        note: note || undefined,
      });
    },
    onSuccess: () => {
      setUserId("");
      setRoleId("");
      setDate("");
      setNote("");
      queryClient.invalidateQueries({ queryKey: ["schedule", teamId] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      await apiClient.delete(`/schedule/${assignmentId}`, { data: { teamId } });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schedule", teamId] }),
  });

  const uniqueRoles = Array.from(
    new Map(members?.map((m) => [m.roleId._id, m.roleId]) ?? []).values()
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-semibold mb-6">Schedule</h1>

      {canManage && (
        <Card className="mb-6">
          <p className="font-display text-sm font-semibold mb-3">Add assignment</p>
          <div className="flex flex-col gap-3">
            <select
              className="text-sm rounded-lg border border-standby-slate/30 px-3 py-2.5 bg-white dark:bg-navy/60"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            >
              <option value="">Select person…</option>
              {members?.map((m) => (
                <option key={m.userId._id} value={m.userId._id}>
                  {m.userId.firstName} {m.userId.lastName}
                </option>
              ))}
            </select>
            <select
              className="text-sm rounded-lg border border-standby-slate/30 px-3 py-2.5 bg-white dark:bg-navy/60"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
            >
              <option value="">Select role…</option>
              {uniqueRoles.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </select>
            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Input
              label="Note (optional)"
              placeholder="e.g. Sunday service"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            {error && <p className="text-sm text-signal-red">{error}</p>}
            <Button
              onClick={() => createMutation.mutate()}
              isLoading={createMutation.isPending}
              disabled={!userId || !roleId || !date}
            >
              Add to schedule
            </Button>
          </div>
        </Card>
      )}

      {isLoading && <p className="text-sm text-standby-slate">Loading…</p>}

      {schedule && schedule.length === 0 && (
        <Card className="text-center">
          <p className="text-standby-slate text-sm">No upcoming assignments.</p>
        </Card>
      )}

      <div className="flex flex-col gap-2">
        {schedule?.map((assignment) => (
          <Card key={assignment._id} className="!p-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-sm">
                {assignment.userId.firstName} {assignment.userId.lastName}
                <span className="text-standby-slate font-normal"> — {assignment.roleId.name}</span>
              </p>
              <p className="text-xs text-standby-slate mt-0.5">
                {new Date(assignment.date).toLocaleDateString(undefined, { dateStyle: "medium" })}
                {assignment.note ? ` · ${assignment.note}` : ""}
              </p>
            </div>
            {canManage && (
              <button
                onClick={() => deleteMutation.mutate(assignment._id)}
                className="text-signal-red text-xs font-medium shrink-0"
              >
                Remove
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
