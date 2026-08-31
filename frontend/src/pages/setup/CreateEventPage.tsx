import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router";
import { apiClient } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/errors";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function CreateEventPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [scheduledStart, setScheduledStart] = useState("");
  const [cameraCount, setCameraCount] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await apiClient.post("/events", {
        teamId,
        title,
        scheduledStart: new Date(scheduledStart).toISOString(),
        cameraCount,
      });
      navigate(`/events/${res.data.data.eventId}`);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't create the event."));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Card>
        <h1 className="font-display text-xl font-semibold mb-1">Schedule an event</h1>
        <p className="text-sm text-standby-slate mb-6">
          Camera assignments are created automatically based on how many cameras you set.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Event title"
            required
            placeholder="e.g. Sunday Morning Service"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            label="Start time"
            type="datetime-local"
            required
            value={scheduledStart}
            onChange={(e) => setScheduledStart(e.target.value)}
          />
          <Input
            label="Number of cameras"
            type="number"
            required
            min={1}
            max={20}
            value={cameraCount}
            onChange={(e) => setCameraCount(parseInt(e.target.value, 10) || 1)}
          />
          {error && <p className="text-sm text-signal-red">{error}</p>}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} className="flex-1">
              Create event
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
