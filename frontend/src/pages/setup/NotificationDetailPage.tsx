import { useParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { Card } from "@/components/ui/Card";
import type { NotificationRecord } from "@/types";

const TYPE_LABELS: Record<string, string> = {
  talkback: "Director cue",
  signal: "Crew signal",
  equipment: "Equipment issue",
  tally: "Tally update",
  ros: "Run of show",
  system: "System notification",
};

export function NotificationDetailPage() {
  const { notificationId } = useParams<{ notificationId: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["notificationDetail", notificationId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: NotificationRecord }>(`/notifications/${notificationId}`);
      return res.data.data;
    },
    enabled: !!notificationId,
  });

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <Link to="/notifications" className="text-xs text-accent-teal font-medium mb-4 inline-block">
        ← Back to notifications
      </Link>

      {isLoading && <p className="text-sm text-standby-slate">Loading…</p>}

      {data && (
        <Card>
          <p className="text-[10px] uppercase tracking-wide text-standby-slate mb-1">
            {TYPE_LABELS[data.type] || data.type}
          </p>
          <h1 className="font-display text-lg font-semibold mb-2">{data.title}</h1>
          {data.body && <p className="text-sm text-standby-slate mb-4">{data.body}</p>}
          <p className="text-xs text-standby-slate/70">
            {new Date(data.createdAt).toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}
          </p>
        </Card>
      )}
    </div>
  );
}
