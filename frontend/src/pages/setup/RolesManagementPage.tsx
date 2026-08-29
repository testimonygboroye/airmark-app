import { useState } from "react";
import { useParams, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/errors";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Role } from "@/types";

const ALL_PERMISSIONS = [
  "team:view", "member:view", "member:invite",
  "event:create", "event:manage", "event:view",
  "tally:control", "tally:view",
  "ros:manage", "ros:control",
  "countdown:control",
  "signal:send", "signal:manage",
  "talkback:send",
  "highlight:create", "highlight:view",
  "equipment:report", "equipment:manage",
  "checklist:manage", "checklist:complete",
  "schedule:manage", "schedule:view",
  "obs:control",
  "role:manage",
];

export function RolesManagementPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftRank, setDraftRank] = useState(5);
  const [draftPermissions, setDraftPermissions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { data: roles, isLoading } = useQuery({
    queryKey: ["roles", teamId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Role[] }>(`/teams/${teamId}/roles`);
      return res.data.data;
    },
    enabled: !!teamId,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/teams/${teamId}/roles`, {
        name: draftName,
        rank: draftRank,
        permissions: draftPermissions,
      });
    },
    onSuccess: () => {
      resetDraft();
      queryClient.invalidateQueries({ queryKey: ["roles", teamId] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: async (roleId: string) => {
      await apiClient.patch(`/teams/${teamId}/roles/${roleId}`, {
        name: draftName,
        rank: draftRank,
        permissions: draftPermissions,
      });
    },
    onSuccess: () => {
      resetDraft();
      queryClient.invalidateQueries({ queryKey: ["roles", teamId] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: async (roleId: string) => {
      await apiClient.delete(`/teams/${teamId}/roles/${roleId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles", teamId] }),
    onError: (err) => setError(getErrorMessage(err)),
  });

  function resetDraft() {
    setCreating(false);
    setEditingRoleId(null);
    setDraftName("");
    setDraftRank(5);
    setDraftPermissions([]);
    setError(null);
  }

  function startEdit(role: Role) {
    setEditingRoleId(role._id);
    setDraftName(role.name);
    setDraftRank(role.rank);
    setDraftPermissions(role.permissions);
    setCreating(false);
  }

  function togglePermission(perm: string) {
    setDraftPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  }

  const isFormOpen = creating || !!editingRoleId;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold">Manage roles</h1>
        <Link to={`/teams/${teamId}/events`} className="text-xs text-accent-teal font-medium">
          Back
        </Link>
      </div>

      {!isFormOpen && (
        <Button onClick={() => setCreating(true)} className="mb-6">
          + Create custom role
        </Button>
      )}

      {isFormOpen && (
        <Card className="mb-6">
          <p className="font-display text-sm font-semibold mb-3">
            {editingRoleId ? "Edit role" : "New role"}
          </p>
          <div className="flex flex-col gap-3">
            <Input label="Role name" value={draftName} onChange={(e) => setDraftName(e.target.value)} />
            <Input
              label="Rank (0 = highest authority)"
              type="number"
              min={0}
              max={10}
              value={draftRank}
              onChange={(e) => setDraftRank(parseInt(e.target.value, 10) || 0)}
            />
            <p className="text-xs text-standby-slate font-medium mt-2">Permissions</p>
            <div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto">
              {ALL_PERMISSIONS.map((perm) => (
                <label key={perm} className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={draftPermissions.includes(perm)}
                    onChange={() => togglePermission(perm)}
                  />
                  {perm}
                </label>
              ))}
            </div>
            {error && <p className="text-sm text-signal-red">{error}</p>}
            <div className="flex gap-2 mt-2">
              <Button variant="ghost" onClick={resetDraft} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={() =>
                  editingRoleId ? updateMutation.mutate(editingRoleId) : createMutation.mutate()
                }
                isLoading={createMutation.isPending || updateMutation.isPending}
                disabled={!draftName || draftPermissions.length === 0}
                className="flex-1"
              >
                Save
              </Button>
            </div>
          </div>
        </Card>
      )}

      {isLoading && <p className="text-sm text-standby-slate">Loading…</p>}

      <div className="flex flex-col gap-2">
        {roles?.map((role) => (
          <Card key={role._id} className="!p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-sm">
                {role.name}
                {role.isSystemRole && (
                  <span className="ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded bg-standby-slate/10 text-standby-slate">
                    Built-in
                  </span>
                )}
              </p>
              <div className="flex gap-3">
                {!(role.isSystemRole && role.name === "Team Owner") && (
                  <button
                    onClick={() => startEdit(role)}
                    className="text-xs text-accent-teal font-medium"
                  >
                    Edit
                  </button>
                )}
                {!role.isSystemRole && (
                  <button
                    onClick={() => deleteMutation.mutate(role._id)}
                    className="text-xs text-signal-red font-medium"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs text-standby-slate">
              {role.permissions.includes("*") ? "All permissions" : `${role.permissions.length} permission(s)`}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
