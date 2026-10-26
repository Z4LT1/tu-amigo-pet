"use client";

import { create } from "zustand";

type Panel = "menu" | "search" | null;

/** Estado de paneles globales (menú móvil y buscador a pantalla completa). */
export const useUI = create<{ panel: Panel; open: (p: Exclude<Panel, null>) => void; close: () => void }>((set) => ({
  panel: null,
  open: (panel) => set({ panel }),
  close: () => set({ panel: null }),
}));
