import { apiClient } from "@/lib/apiClient";

export async function checkLogoutAllowed(): Promise<{ blocked: boolean; reason: string | null }> {
  try {
    const res = await apiClient.get("/auth/logout-guard");
    return res.data.data;
  } catch {
    // If the check itself fails (e.g. network hiccup), fail safe by
    // allowing logout rather than permanently trapping the user.
    return { blocked: false, reason: null };
  }
}
