import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Locale } from "../i18n/index.ts";

type PlantUmlMode = "local" | "remote";

type AppState = {
  activeToolId: string | null;
  searchQuery: string;
  locale: Locale;
  favoriteToolIds: string[];
  sidebarAutoCollapse: boolean;
  plantumlMode: PlantUmlMode;
  plantumlServer: string;
  setSidebarAutoCollapse: (v: boolean) => void;
  setActiveTool: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
  setLocale: (locale: Locale) => void;
  toggleFavoriteTool: (id: string) => void;
  setPlantumlMode: (mode: PlantUmlMode) => void;
  setPlantumlServer: (url: string) => void;
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      activeToolId: null,
      searchQuery: "",
      locale: "zh",
      favoriteToolIds: [],
      sidebarAutoCollapse: false,
      plantumlMode: "local",
      plantumlServer: "https://www.plantuml.com/plantuml",
      setActiveTool: (id) => set({ activeToolId: id }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      setLocale: (locale) => set({ locale }),
      toggleFavoriteTool: (id) =>
        set((state) => ({
          favoriteToolIds: state.favoriteToolIds.includes(id)
            ? state.favoriteToolIds.filter((v) => v !== id)
            : [...state.favoriteToolIds, id],
        })),
      setSidebarAutoCollapse: (v: boolean) => set({ sidebarAutoCollapse: v }),
      setPlantumlMode: (mode: PlantUmlMode) => set({ plantumlMode: mode }),
      setPlantumlServer: (url: string) => set({ plantumlServer: url }),
    }),
    {
      name: "devkits-state",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        locale: state.locale,
        favoriteToolIds: state.favoriteToolIds,
        sidebarAutoCollapse: state.sidebarAutoCollapse,
        plantumlMode: state.plantumlMode,
        plantumlServer: state.plantumlServer,
      }),
    }
  )
);
