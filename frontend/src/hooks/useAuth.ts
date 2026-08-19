import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/lib/apiClient";
import { connectSocket, disconnectSocket } from "@/lib/socketClient";

/**
 * Runs once at app boot. Attempts a silent refresh using the httpOnly
 * refresh cookie (if present) to restore a session without requiring the
 * user to log in again on every reload — the standard pattern for
 * short-lived in-memory access tokens.
 */
export function useAuthHydration(): void {
  const { setAuth, clearAuth, setHydrating, accessToken } = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const refreshRes = await apiClient.post("/auth/refresh");
        const newToken = refreshRes.data.data.accessToken;

        const meRes = await apiClient.get("/auth/me", {
          headers: { Authorization: `Bearer ${newToken}` },
        });

        if (!cancelled) {
          setAuth(newToken, meRes.data.data);
          connectSocket(newToken);
        }
      } catch {
        if (!cancelled) clearAuth();
      } finally {
        if (!cancelled) setHydrating(false);
      }
    }

    hydrate();
    return () => {
      cancelled = true;
      disconnectSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (accessToken) connectSocket(accessToken);
  }, [accessToken]);
}
