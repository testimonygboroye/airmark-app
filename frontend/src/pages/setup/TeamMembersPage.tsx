import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/errors";
import { useTeamRole } from "@/hooks/useTeamRole";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { TeamMemberEntry, TeamInviteRecord, Role, Membership } from "@/types";

export function TeamMembersPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const queryClient = useQueryClient();
  const { hasPermission } = useTeamRole(teamId);
  const canManageTeam = hasPermission("team:manage");

  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [editingName, setEditingName] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [renameMessage, setRenameMessage] = useState<string | null>(null);

  const { data: myTeams } = useQuery({
    queryKey: ["myTeams"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Membership[] }>("/teams/my");
      return res.data.data;
    },
  });

  const currentTeam = myTeams?.find((m) => m.teamId._id === teamId)?.teamId;

  useEffect(() => {
    if (currentTeam) setTeamName(currentTeam.name);
  }, [currentTeam]);

  const renameMutation = useMutation({
    mutationFn: async () => {
      await apiClient.patch(`/teams/${teamId}`, { name: teamName });
    },
    onSuccess: () => {
      setEditingName(false);
      setRenameMessage("Team renamed.");
      queryClient.invalidateQueries({ queryKey: ["myTeams"] });
      setTimeout(() => setRenameMessage(null), 3000);
    },
  });

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["teamMembers", teamId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: TeamMemberEntry[] }>(`/teams/${teamId}/members`);
      return res.data.data;
    },
    enabled: !!teamId,
  });

  const { data: roles } = useQuery({
    queryKey: ["roles", teamId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Role[] }>(`/teams/${teamId}/roles`);
      return res.data.data;
    },
    enabled: !!teamId,
  });

  const { data: pendingInvites } = useQuery({
    queryKey: ["pendingInvites", teamId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: TeamInviteRecord[] }>(`/teams/${teamId}/invites`);
      return res.data.data;
    },
    enabled: !!teamId,
  });

  const inviteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post<{ message: string }>(`/teams/${teamId}/invites`, { email, roleId });
      return res.data.message;
    },
    onSuccess: (msg) => {
      setMessage(msg);
      setEmail("");
      setRoleId("");
      queryClient.invalidateQueries({ queryKey: ["pendingInvites", teamId] });
      setTimeout(() => setMessage(null), 4000);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const revokeMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      await apiClient.delete(`/teams/${teamId}/invites/${inviteId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pendingInvites", teamId] }),
  });

  const [showTransfer, setShowTransfer] = useState(false);
  const [transferTarget, setTransferTarget] = useState("");
  const [transferMessage, setTransferMessage] = useState<string | null>(null);
  const transferMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post<{ message: string }>(`/teams/${teamId}/transfer-ownership`, {
        newOwnerMembershipId: transferTarget,
      });
      return res.data.message;
    },
    onSuccess: (msg) => {
      setTransferMessage(msg);
      setShowTransfer(false);
      queryClient.invalidateQueries({ queryKey: ["teamMembers", teamId] });
      queryClient.invalidateQueries({ queryKey: ["myTeams"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (membershipId: string) => {
      await apiClient.delete(`/teams/${teamId}/members/${membershipId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teamMembers", teamId] }),
    onError: (err) => setError(getErrorMessage(err)),
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        {editingName ? (
          <div className="flex items-center gap-2 flex-1">
            <Input label="" value={teamName} onChange={(e) => setTeamName(e.target.value)} className="flex-1" />
            <button
              onClick={() => renameMutation.mutate()}
              disabled={renameMutation.isPending || !teamName.trim()}
              className="text-xs font-semibold text-accent-teal shrink-0"
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditingName(false);
                setTeamName(currentTeam?.name ?? "");
              }}
              className="text-xs text-standby-slate shrink-0"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="font-display text-2xl font-semibold truncate">{currentTeam?.name ?? "Team members"}</h1>
            {canManageTeam && (
              <button onClick={() => setEditingName(true)} className="text-xs text-accent-teal font-medium shrink-0">
                Rename
              </button>
            )}
          </div>
        )}
        <Link to={`/teams/${teamId}/events`} className={`text-xs text-accent-teal font-medium shrink-0 ${editingName ? "hidden sm:inline" : ""}`}>
          Back
        </Link>
      </div>

      {renameMessage && <p className="text-sm text-accent-teal mb-4">{renameMessage}</p>}

      <Card className="mb-6">
        <p className="font-display text-sm font-semibold mb-3">Invite someone</p>
        <div className="flex flex-col gap-3">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
          />
          <select
            className="text-sm rounded-lg border border-standby-slate/30 px-3 py-2.5 bg-white dark:bg-navy/60"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
          >
            <option value="">Select role…</option>
            {roles?.filter((r) => r.name !== "Team Owner").map((r) => (
              <option key={r._id} value={r._id}>
                {r.name}
              </option>
            ))}
          </select>
          {error && <p className="text-sm text-signal-red">{error}</p>}
          {message && <p className="text-sm text-accent-teal">{message}</p>}
          <Button
            onClick={() => inviteMutation.mutate()}
            isLoading={inviteMutation.isPending}
            disabled={!email || !roleId}
          >
            Send invite
          </Button>
        </div>
      </Card>

      {pendingInvites && pendingInvites.length > 0 && (
        <>
          <h2 className="font-display text-sm font-semibold text-standby-slate uppercase tracking-wide mb-3">
            Pending invites
          </h2>
          <div className="flex flex-col gap-2 mb-6">
            {pendingInvites.map((invite) => (
              <Card key={invite._id} className="!p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{invite.email}</p>
                  <p className="text-xs text-standby-slate mt-0.5">
                    Invited as {invite.roleId.name} · expires{" "}
                    {new Date(invite.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => confirm(`Revoke the invite to ${invite.email}?`) && revokeMutation.mutate(invite._id)}
                  className="text-xs text-signal-red font-medium"
                >
                  Revoke
                </button>
              </Card>
            ))}
          </div>
        </>
      )}

      <h2 className="font-display text-sm font-semibold text-standby-slate uppercase tracking-wide mb-3">
        Current members
      </h2>
      {membersLoading && <p className="text-sm text-standby-slate">Loading…</p>}
      <div className="flex flex-col gap-2">
        {members?.map((m) => (
          <Card key={m._id} className="!p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">
                {m.userId.firstName} {m.userId.lastName}
              </p>
              <p className="text-xs text-standby-slate mt-0.5">
                {m.userId.email} · {m.roleId.name}
              </p>
            </div>
            {m.roleId.name !== "Team Owner" && (
              <button
                onClick={() => {
                  if (confirm(`Remove ${m.userId.firstName} from the team?`)) {
                    removeMutation.mutate(m._id);
                  }
                }}
                className="text-xs text-signal-red font-medium shrink-0"
              >
                Remove
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
