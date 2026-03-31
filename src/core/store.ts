import { create } from "zustand";
import type { Locale } from "../i18n/index.ts";

type AppState = {
  activeToolId: string | null;
  searchQuery: string;
  locale: Locale;
  setActiveTool: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
  setLocale: (locale: Locale) => void;
};

export const useStore = create<AppState>((set) => ({
  activeToolId: null,
  searchQuery: "",
  locale: "zh",
  setActiveTool: (id) => set({ activeToolId: id }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setLocale: (locale) => set({ locale }),
}));
