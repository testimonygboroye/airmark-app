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
  const [cameraCountInput, setCameraCountInput] = useState("2");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function validateCameraCount(): number | null {
    if (cameraCountInput.trim() === "") return null;
    if (!/^\d+$/.test(cameraCountInput.trim())) return null;
    const n = parseInt(cameraCountInput, 10);
    if (n < 1 || n > 20) return null;
    return n;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const cameraCount = validateCameraCount();
    if (cameraCount === null) {
      setError("Number of cameras must be a whole number between 1 and 20.");
      return;
    }

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
          Camera assignments are created automatically based on how many cameras you set. You can add or remove cameras later.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Event title" required placeholder="e.g. Sunday Morning Service" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input label="Start time" type="datetime-local" required value={scheduledStart} onChange={(e) => setScheduledStart(e.target.value)} />
          <Input
            label="Number of cameras"
            required
            inputMode="numeric"
            placeholder="e.g. 3"
            value={cameraCountInput}
            onChange={(e) => setCameraCountInput(e.target.value.replace(/[^\d]/g, ""))}
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
