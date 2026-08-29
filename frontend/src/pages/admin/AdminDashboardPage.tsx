import { Navigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";
import { Card } from "@/components/ui/Card";
import type { AdminTeamEntry, AdminUserEntry, AdminStats } from "@/types";

export function AdminDashboardPage() {
  const { user } = useAuthStore();

  const { data: stats } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: AdminStats }>("/admin/stats");
      return res.data.data;
    },
    enabled: !!user?.isSuperAdmin,
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ["adminTeams"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: AdminTeamEntry[] }>("/admin/teams");
      return res.data.data;
    },
    enabled: !!user?.isSuperAdmin,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: AdminUserEntry[] }>("/admin/users");
      return res.data.data;
    },
    enabled: !!user?.isSuperAdmin,
  });

  if (!user?.isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-semibold mb-1">System Console</h1>
      <p className="text-sm text-standby-slate mb-6">
        Founder-level view across all teams and accounts on Airmark.
      </p>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <Card className="!p-4">
            <p className="text-2xl font-display font-bold">{stats.teamCount}</p>
            <p className="text-xs text-standby-slate">Teams</p>
          </Card>
          <Card className="!p-4">
            <p className="text-2xl font-display font-bold">{stats.userCount}</p>
            <p className="text-xs text-standby-slate">Users</p>
          </Card>
          <Card className="!p-4">
            <p className="text-2xl font-display font-bold text-accent-teal">{stats.verifiedCount}</p>
            <p className="text-xs text-standby-slate">Verified</p>
          </Card>
          <Card className="!p-4">
            <p className="text-2xl font-display font-bold text-signal-red">{stats.unverifiedCount}</p>
            <p className="text-xs text-standby-slate">Unverified</p>
          </Card>
        </div>
      )}

      <h2 className="font-display text-sm font-semibold text-standby-slate uppercase tracking-wide mb-3">
        Teams
      </h2>
      <div className="overflow-x-auto mb-8 rounded-xl border border-standby-slate/15">
        <table className="w-full text-sm">
          <thead className="bg-standby-slate/5 text-xs text-standby-slate uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-2.5">Name</th>
              <th className="text-left px-4 py-2.5">Owner</th>
              <th className="text-left px-4 py-2.5">Members</th>
              <th className="text-left px-4 py-2.5">Created</th>
            </tr>
          </thead>
          <tbody>
            {teamsLoading && (
              <tr><td className="px-4 py-3 text-standby-slate" colSpan={4}>Loading…</td></tr>
            )}
            {teams?.map((team) => (
              <tr key={team._id} className="border-t border-standby-slate/10">
                <td className="px-4 py-2.5 font-medium">{team.name}</td>
                <td className="px-4 py-2.5 text-standby-slate">
                  {team.createdBy.firstName} {team.createdBy.lastName}
                </td>
                <td className="px-4 py-2.5">{team.memberCount}</td>
                <td className="px-4 py-2.5 text-standby-slate">
                  {new Date(team.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="font-display text-sm font-semibold text-standby-slate uppercase tracking-wide mb-3">
        Users
      </h2>
      <div className="overflow-x-auto rounded-xl border border-standby-slate/15">
        <table className="w-full text-sm">
          <thead className="bg-standby-slate/5 text-xs text-standby-slate uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-2.5">Name</th>
              <th className="text-left px-4 py-2.5">Email</th>
              <th className="text-left px-4 py-2.5">Verified</th>
              <th className="text-left px-4 py-2.5">Role</th>
            </tr>
          </thead>
          <tbody>
            {usersLoading && (
              <tr><td className="px-4 py-3 text-standby-slate" colSpan={4}>Loading…</td></tr>
            )}
            {users?.map((u) => (
              <tr key={u._id} className="border-t border-standby-slate/10">
                <td className="px-4 py-2.5 font-medium">
                  {u.firstName} {u.middleName ? u.middleName + " " : ""}{u.lastName}
                </td>
                <td className="px-4 py-2.5 text-standby-slate">{u.email}</td>
                <td className="px-4 py-2.5">
                  {u.isEmailVerified ? (
                    <span className="text-accent-teal text-xs font-semibold">Verified</span>
                  ) : (
                    <span className="text-signal-red text-xs font-semibold">Unverified</span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  {u.isSuperAdmin && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-signal-red/10 text-signal-red">
                      Founder
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
