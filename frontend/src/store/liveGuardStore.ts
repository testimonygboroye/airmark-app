import { create } from "zustand";

interface LiveGuardState {
  blockReason: string | null;
  setGuard: (reason: string) => void;
  clearGuard: () => void;
}

/**
 * Lets DirectorLiveView/OperatorLiveView tell LiveLayout "don't allow
 * logout right now" without the layout needing to know event/camera
 * details itself — the live views own that state, the layout just reads
 * whether a reason is currently set.
 */
export const useLiveGuardStore = create<LiveGuardState>((set) => ({
  blockReason: null,
  setGuard: (reason) => set({ blockReason: reason }),
  clearGuard: () => set({ blockReason: null }),
}));
