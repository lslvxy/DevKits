import { create } from "zustand";

type AppState = {
  activeToolId: string | null;
  searchQuery: string;
  setActiveTool: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
};

export const useStore = create<AppState>((set) => ({
  activeToolId: null,
  searchQuery: "",
  setActiveTool: (id) => set({ activeToolId: id }),
  setSearchQuery: (q) => set({ searchQuery: q }),
}));
