import { create } from "zustand";
import type { AuthUser } from "@/types";

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isHydrating: boolean;
  setAuth: (accessToken: string, user: AuthUser) => void;
  setUser: (user: AuthUser) => void;
  clearAuth: () => void;
  setHydrating: (value: boolean) => void;
}

/**
 * Access token lives in memory only — never localStorage — per security
 * baseline. The refresh token is a separate httpOnly cookie the browser
 * manages automatically; this store never touches it directly.
 */
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isHydrating: true,
  setAuth: (accessToken, user) => set({ accessToken, user }),
  setUser: (user) => set({ user }),
  clearAuth: () => set({ accessToken: null, user: null }),
  setHydrating: (value) => set({ isHydrating: value }),
}));
