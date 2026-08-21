import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { TeamMemberEntry } from "@/types";

export function ChecklistTemplateEditorPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const [searchParams] = useSearchParams();
  const roleId = searchParams.get("roleId") || "";
  const roleName = searchParams.get("roleName") || "";
  const queryClient = useQueryClient();
  const [items, setItems] = useState<string[]>([""]);
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["checklistTemplate", teamId, roleId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: { items: { text: string }[] } }>(
        `/teams/${teamId}/checklist-templates/${roleId}`
      );
      return res.data.data;
    },
    enabled: !!teamId && !!roleId,
  });

  useEffect(() => {
    if (data) {
      setItems(data.items.length > 0 ? data.items.map((i) => i.text) : [""]);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = items.filter((t) => t.trim().length > 0).map((text) => ({ text: text.trim() }));
      await apiClient.put(`/teams/${teamId}/checklist-templates/${roleId}`, { items: payload });
    },
    onSuccess: () => {
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ["checklistTemplate", teamId, roleId] });
      setTimeout(() => setSaved(false), 2000);
    },
  });

  function updateItem(index: number, value: string) {
    setItems((prev) => prev.map((v, i) => (i === index ? value : v)));
  }

  function addItem() {
    setItems((prev) => [...prev, ""]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  if (isLoading) {
    return <div className="max-w-md mx-auto px-4 py-8 text-sm text-standby-slate">Loading…</div>;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl font-semibold">{roleName} checklist</h1>
        <Link to={`/teams/${teamId}/events`} className="text-xs text-accent-teal font-medium">
          Done
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              label=""
              placeholder={`Item ${index + 1}`}
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              className="flex-1"
            />
            <button
              onClick={() => removeItem(index)}
              className="text-signal-red text-sm px-2"
              aria-label="Remove item"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addItem}
        className="mt-3 w-full py-3 rounded-lg border-2 border-dashed border-standby-slate/30 text-sm text-standby-slate font-medium"
      >
        + Add item
      </button>

      {saved && <p className="text-sm text-accent-teal mt-4">Checklist saved.</p>}

      <Button onClick={() => saveMutation.mutate()} isLoading={saveMutation.isPending} className="w-full mt-4">
        Save checklist
      </Button>
    </div>
  );
}
