import { create } from "zustand";

interface NavHistoryState {
  lastHomePath: string;
  setLastHomePath: (path: string) => void;
}

export const useNavHistoryStore = create<NavHistoryState>((set) => ({
  lastHomePath: "/dashboard",
  setLastHomePath: (path) => set({ lastHomePath: path }),
}));
