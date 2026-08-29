import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { getSocket } from "@/lib/socketClient";
import type { NotificationRecord } from "@/types";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: { notifications: NotificationRecord[]; unreadCount: number } }>(
        "/notifications"
      );
      return res.data.data;
    },
    refetchInterval: 30000,
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    function handleNew() {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
    socket.on("notification:new", handleNew);
    return () => {
      socket.off("notification:new", handleNew);
    };
  }, [queryClient]);

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

  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative p-2 -mr-2"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2a7 7 0 00-7 7v4l-2 3h18l-2-3V9a7 7 0 00-7-7z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M9.5 20a2.5 2.5 0 005 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-signal-red text-white text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-navy border border-standby-slate/15 rounded-xl shadow-lg z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-standby-slate/10">
              <p className="font-display text-sm font-semibold">Notifications</p>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllReadMutation.mutate()}
                  className="text-xs text-accent-teal font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>

            {(!data || data.notifications.length === 0) && (
              <p className="text-sm text-standby-slate text-center py-8">No notifications yet.</p>
            )}

            {data?.notifications.map((n) => (
              <button
                key={n._id}
                onClick={() => !n.read && markReadMutation.mutate(n._id)}
                className={`w-full text-left px-4 py-3 border-b border-standby-slate/5 ${
                  !n.read ? "bg-accent-teal/5" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-accent-teal mt-1.5 shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{n.title}</p>
                    {n.body && <p className="text-xs text-standby-slate mt-0.5 truncate">{n.body}</p>}
                    <p className="text-[10px] text-standby-slate/70 mt-1">
                      {new Date(n.createdAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
