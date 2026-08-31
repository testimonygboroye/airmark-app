import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { Membership } from "@/types";

export function useTeamRole(teamId: string | undefined) {
  const { data, isLoading } = useQuery({
    queryKey: ["myTeams"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Membership[] }>("/teams/my");
      return res.data.data;
    },
  });

  const membership = data?.find((m) => m.teamId._id === teamId);

  return {
    isLoading,
    roleName: membership?.roleId.name,
    permissions: membership?.roleId.permissions ?? [],
    /**
     * Returns `undefined` while still loading (rather than a false
     * `false`), so callers can distinguish "still checking" from
     * "confirmed no access" and avoid a flash of denied-state UI.
     */
    hasPermission: (key: string): boolean => {
      if (isLoading) return false;
      return (
        membership?.roleId.permissions.includes("*") ||
        membership?.roleId.permissions.includes(key) ||
        false
      );
    },
    isReady: !isLoading,
  };
}
