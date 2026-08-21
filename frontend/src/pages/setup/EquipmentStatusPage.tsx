import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router";
import { apiClient } from "@/lib/apiClient";
import { Card } from "@/components/ui/Card";
import type { EquipmentIssueRecord, EventRecord } from "@/types";

const LABELS: Record<string, string> = {
  battery_low: "Battery low",
  storage_full: "Storage almost full",
  equipment_fault: "Equipment fault",
  other: "Other issue",
};

export function EquipmentStatusPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const queryClient = useQueryClient();

  const { data: eventData } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: { event: EventRecord } }>(`/events/${eventId}`);
      return res.data.data;
    },
    enabled: !!eventId,
  });

  const { data: issues, isLoading } = useQuery({
    queryKey: ["equipment", eventId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: EquipmentIssueRecord[] }>(
        `/events/${eventId}/equipment`
      );
      return res.data.data;
    },
    enabled: !!eventId,
  });

  const resolveMutation = useMutation({
    mutationFn: async (issueId: string) => {
      await apiClient.patch(`/events/${eventId}/equipment/${issueId}/resolve`, {
        teamId: eventData?.event.teamId,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["equipment", eventId] }),
  });

  const openIssues = issues?.filter((i) => i.status === "open") ?? [];
  const resolvedIssues = issues?.filter((i) => i.status === "resolved") ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Equipment status</h1>
          <p className="text-sm text-standby-slate mt-1">{eventData?.event.title}</p>
        </div>
        <Link to={`/events/${eventId}`} className="text-xs text-accent-teal font-medium">
          Back to event
        </Link>
      </div>

      {isLoading && <p className="text-sm text-standby-slate">Loading…</p>}

      {openIssues.length > 0 && (
        <>
          <h2 className="text-xs font-semibold text-signal-red uppercase tracking-wide mb-2">
            Open
          </h2>
          <div className="flex flex-col gap-2 mb-6">
            {openIssues.map((issue) => (
              <Card key={issue._id} className="!p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-sm">{LABELS[issue.issueType]}</p>
                  <p className="text-xs text-standby-slate mt-0.5">
                    {issue.reportedBy.firstName} {issue.reportedBy.lastName} ·{" "}
                    {new Date(issue.createdAt).toLocaleTimeString(undefined, { timeStyle: "short" })}
                  </p>
                </div>
                <button
                  onClick={() => resolveMutation.mutate(issue._id)}
                  disabled={resolveMutation.isPending}
                  className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-accent-teal text-navy"
                >
                  Resolve
                </button>
              </Card>
            ))}
          </div>
        </>
      )}

      {issues && openIssues.length === 0 && (
        <Card className="text-center mb-6">
          <p className="text-standby-slate text-sm">No open equipment issues.</p>
        </Card>
      )}

      {resolvedIssues.length > 0 && (
        <>
          <h2 className="text-xs font-semibold text-standby-slate uppercase tracking-wide mb-2">
            Resolved
          </h2>
          <div className="flex flex-col gap-2">
            {resolvedIssues.map((issue) => (
              <Card key={issue._id} className="!p-4 opacity-60">
                <p className="font-medium text-sm">{LABELS[issue.issueType]}</p>
                <p className="text-xs text-standby-slate mt-0.5">
                  {issue.reportedBy.firstName} {issue.reportedBy.lastName}
                </p>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
