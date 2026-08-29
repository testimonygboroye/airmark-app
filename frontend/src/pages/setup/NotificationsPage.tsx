import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { Card } from "@/components/ui/Card";
import type { NotificationRecord } from "@/types";

export function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: { notifications: NotificationRecord[]; unreadCount: number } }>(
        "/notifications"
      );
      return res.data.data;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/notifications/${id}/read`);
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
      <div className="flex items-center justify-between mb-6">
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

      {isLoading && <p className="text-sm text-standby-slate">Loading…</p>}

      {data && data.notifications.length === 0 && (
        <Card className="text-center">
          <p className="text-standby-slate text-sm">No notifications yet.</p>
        </Card>
      )}

      <div className="flex flex-col gap-2">
        {data?.notifications.map((n) => (
          <button
            key={n._id}
            onClick={() => !n.read && markReadMutation.mutate(n._id)}
            className="w-full text-left"
          >
            <Card className={`!p-4 ${!n.read ? "border-accent-teal/40" : ""}`}>
              <div className="flex items-start gap-2">
                {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-accent-teal mt-1.5 shrink-0" />}
                <div className="min-w-0">
                  <p className="text-sm font-medium">{n.title}</p>
                  {n.body && <p className="text-xs text-standby-slate mt-0.5">{n.body}</p>}
                  <p className="text-[10px] text-standby-slate/70 mt-1">
                    {new Date(n.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
