import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/errors";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { EventRecord } from "@/types";

export function EditEventPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [scheduledStart, setScheduledStart] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: { event: EventRecord } }>(`/events/${eventId}`);
      return res.data.data;
    },
    enabled: !!eventId,
  });

  useEffect(() => {
    if (data?.event) {
      setTitle(data.event.title);
      setScheduledStart(new Date(data.event.scheduledStart).toISOString().slice(0, 16));
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      await apiClient.patch(`/events/${eventId}`, {
        title,
        scheduledStart: new Date(scheduledStart).toISOString(),
      });
    },
    onSuccess: () => navigate(`/events/${eventId}`),
    onError: (err) => setError(getErrorMessage(err)),
  });

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Card>
        <h1 className="font-display text-xl font-semibold mb-4">Edit event</h1>
        <div className="flex flex-col gap-4">
          <Input label="Event title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input
            label="Start time"
            type="datetime-local"
            value={scheduledStart}
            onChange={(e) => setScheduledStart(e.target.value)}
          />
          {error && <p className="text-sm text-signal-red">{error}</p>}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate(`/events/${eventId}`)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={() => updateMutation.mutate()} isLoading={updateMutation.isPending} className="flex-1">
              Save
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
