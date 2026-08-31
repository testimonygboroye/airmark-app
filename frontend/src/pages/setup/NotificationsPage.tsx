import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { Card } from "@/components/ui/Card";
import type { NotificationRecord } from "@/types";

type FilterType = "all" | "unread" | "read";

export function NotificationsPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", filter],
    queryFn: async () => {
      const res = await apiClient.get<{ data: { notifications: NotificationRecord[]; unreadCount: number } }>(
        "/notifications",
        { params: filter !== "all" ? { filter } : {} }
      );
      return res.data.data;
    },
  });

  const toggleReadMutation = useMutation({
    mutationFn: async ({ id, read }: { id: string; read: boolean }) => {
      await apiClient.patch(`/notifications/${id}/${read ? "unread" : "read"}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await apiClient.patch("/notifications/read-all");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="font-display text-2xl font-semibold">Notifications</h1>
        {!!data?.unreadCount && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            className="text-xs text-accent-teal font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        {(["all", "unread", "read"] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full capitalize ${
              filter === f ? "bg-accent-teal text-navy" : "bg-standby-slate/10 text-standby-slate"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-standby-slate">Loading…</p>}

      {data && data.notifications.length === 0 && (
        <Card className="text-center">
          <p className="text-standby-slate text-sm">No notifications here.</p>
        </Card>
      )}

      <div className="flex flex-col gap-2">
        {data?.notifications.map((n) => (
          <Card key={n._id} className={`!p-4 ${!n.read ? "border-accent-teal/40" : ""}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 min-w-0">
                {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-accent-teal mt-1.5 shrink-0" />}
                <div className="min-w-0">
                  <p className="text-sm font-medium">{n.title}</p>
                  {n.body && <p className="text-xs text-standby-slate mt-0.5">{n.body}</p>}
                  <p className="text-[10px] text-standby-slate/70 mt-1">
                    {new Date(n.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleReadMutation.mutate({ id: n._id, read: n.read })}
                className="text-xs text-accent-teal font-medium shrink-0"
              >
                {n.read ? "Mark unread" : "Mark read"}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
