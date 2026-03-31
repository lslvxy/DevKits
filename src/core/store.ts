import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Locale } from "../i18n/index.ts";

type AppState = {
  activeToolId: string | null;
  searchQuery: string;
  locale: Locale;
  favoriteToolIds: string[];
  setActiveTool: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
  setLocale: (locale: Locale) => void;
  toggleFavoriteTool: (id: string) => void;
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      activeToolId: null,
      searchQuery: "",
      locale: "zh",
      favoriteToolIds: [],
      setActiveTool: (id) => set({ activeToolId: id }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      setLocale: (locale) => set({ locale }),
      toggleFavoriteTool: (id) =>
        set((state) => ({
          favoriteToolIds: state.favoriteToolIds.includes(id)
            ? state.favoriteToolIds.filter((v) => v !== id)
            : [...state.favoriteToolIds, id],
        })),
    }),
    {
      name: "devkits-state",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        locale: state.locale,
        favoriteToolIds: state.favoriteToolIds,
      }),
    }
  )
);
