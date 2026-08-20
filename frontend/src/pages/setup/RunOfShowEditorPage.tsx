import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/errors";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { RunOfShowSegmentRecord, EventRecord } from "@/types";

interface DraftSegment {
  title: string;
  notes: string;
}

export function RunOfShowEditorPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<DraftSegment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const { data: eventData } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: { event: EventRecord } }>(`/events/${eventId}`);
      return res.data.data;
    },
    enabled: !!eventId,
  });

  const { data: segments, isLoading } = useQuery({
    queryKey: ["segments", eventId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: RunOfShowSegmentRecord[] }>(
        `/events/${eventId}/segments`
      );
      return res.data.data;
    },
    enabled: !!eventId,
  });

  useEffect(() => {
    if (segments) {
      setDrafts(
        segments.length > 0
          ? segments.map((s) => ({ title: s.title, notes: s.notes || "" }))
          : [{ title: "", notes: "" }]
      );
    }
  }, [segments]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = drafts
        .filter((d) => d.title.trim().length > 0)
        .map((d) => ({ title: d.title.trim(), notes: d.notes.trim() || undefined }));
      await apiClient.put(`/events/${eventId}/segments`, {
        teamId: eventData?.event.teamId,
        segments: payload,
      });
    },
    onSuccess: () => {
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ["segments", eventId] });
      setTimeout(() => setSaved(false), 2500);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  function updateDraft(index: number, field: keyof DraftSegment, value: string) {
    setDrafts((prev) => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  }

  function addSegment() {
    setDrafts((prev) => [...prev, { title: "", notes: "" }]);
  }

  function removeSegment(index: number) {
    setDrafts((prev) => prev.filter((_, i) => i !== index));
  }

  function moveSegment(index: number, direction: -1 | 1) {
    setDrafts((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  if (isLoading) {
    return <div className="max-w-2xl mx-auto px-4 py-8 text-sm text-standby-slate">Loading…</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Run of show</h1>
          <p className="text-sm text-standby-slate mt-1">
            {eventData?.event.title}
          </p>
        </div>
        <Link to={`/events/${eventId}`} className="text-xs text-accent-teal font-medium">
          Back to event
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {drafts.map((draft, index) => (
          <Card key={index} className="!p-4">
            <div className="flex items-start gap-3">
              <div className="flex flex-col gap-1 pt-2">
                <button
                  onClick={() => moveSegment(index, -1)}
                  disabled={index === 0}
                  className="text-standby-slate disabled:opacity-20"
                  aria-label="Move up"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveSegment(index, 1)}
                  disabled={index === drafts.length - 1}
                  className="text-standby-slate disabled:opacity-20"
                  aria-label="Move down"
                >
                  ▼
                </button>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <Input
                  label={`Segment ${index + 1}`}
                  placeholder="e.g. Announcements"
                  value={draft.title}
                  onChange={(e) => updateDraft(index, "title", e.target.value)}
                />
                <Input
                  label="Notes (optional)"
                  placeholder="e.g. Cue slide 4"
                  value={draft.notes}
                  onChange={(e) => updateDraft(index, "notes", e.target.value)}
                />
              </div>
              <button
                onClick={() => removeSegment(index)}
                className="text-signal-red text-sm font-medium pt-2"
                aria-label="Remove segment"
              >
                ✕
              </button>
            </div>
          </Card>
        ))}
      </div>

      <button
        onClick={addSegment}
        className="mt-3 w-full py-3 rounded-lg border-2 border-dashed border-standby-slate/30 text-sm text-standby-slate font-medium"
      >
        + Add segment
      </button>

      {error && <p className="text-sm text-signal-red mt-4">{error}</p>}
      {saved && <p className="text-sm text-accent-teal mt-4">Run of show saved.</p>}

      <Button
        onClick={() => saveMutation.mutate()}
        isLoading={saveMutation.isPending}
        className="w-full mt-4"
      >
        Save run of show
      </Button>
    </div>
  );
}
