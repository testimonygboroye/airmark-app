import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router";
import { apiClient } from "@/lib/apiClient";
import { Card } from "@/components/ui/Card";
import type { ChecklistItemState, EventRecord } from "@/types";

export function EventChecklistPage() {
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

  const { data: items, isLoading } = useQuery({
    queryKey: ["checklist", eventId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: ChecklistItemState[] }>(
        `/events/${eventId}/checklist/mine`,
        { params: { teamId: eventData?.event.teamId } }
      );
      return res.data.data;
    },
    enabled: !!eventId && !!eventData?.event.teamId,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ itemId, completed }: { itemId: string; completed: boolean }) => {
      await apiClient.patch(`/events/${eventId}/checklist/mine/${itemId}`, {
        teamId: eventData?.event.teamId,
        completed,
      });
    },
    onMutate: async ({ itemId, completed }) => {
      queryClient.setQueryData<ChecklistItemState[]>(["checklist", eventId], (old) =>
        old?.map((i) => (i.itemId === itemId ? { ...i, completed } : i))
      );
    },
  });

  const completedCount = items?.filter((i) => i.completed).length ?? 0;
  const totalCount = items?.length ?? 0;

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Pre-event checklist</h1>
          <p className="text-sm text-standby-slate mt-1">{eventData?.event.title}</p>
        </div>
        <Link to={`/events/${eventId}`} className="text-xs text-accent-teal font-medium">
          Back
        </Link>
      </div>

      {isLoading && <p className="text-sm text-standby-slate">Loading…</p>}

      {items && totalCount === 0 && (
        <Card className="text-center">
          <p className="text-standby-slate text-sm">
            No checklist has been set up for your role yet.
          </p>
        </Card>
      )}

      {totalCount > 0 && (
        <>
          <div className="mb-4">
            <div className="flex justify-between text-xs text-standby-slate mb-1">
              <span>Progress</span>
              <span>{completedCount}/{totalCount}</span>
            </div>
            <div className="h-2 rounded-full bg-standby-slate/15 overflow-hidden">
              <div
                className="h-full bg-accent-teal transition-all"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {items?.map((item) => (
              <button
                key={item.itemId}
                onClick={() =>
                  toggleMutation.mutate({ itemId: item.itemId, completed: !item.completed })
                }
                className="w-full"
              >
                <Card
                  className={`!p-4 flex items-center gap-3 text-left transition-colors ${
                    item.completed ? "border-accent-teal/40" : ""
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                      item.completed
                        ? "bg-accent-teal border-accent-teal"
                        : "border-standby-slate/40"
                    }`}
                  >
                    {item.completed && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13l4 4L19 7" stroke="#0B0F14" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm ${item.completed ? "line-through text-standby-slate" : ""}`}>
                    {item.text}
                  </span>
                </Card>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
