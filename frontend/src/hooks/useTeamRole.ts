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
    hasPermission: (key: string) =>
      membership?.roleId.permissions.includes("*") ||
      membership?.roleId.permissions.includes(key) ||
      false,
  };
}
