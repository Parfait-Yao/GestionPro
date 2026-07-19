"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeId =
  | "sky"
  | "dark"
  | "midnight"
  | "forest"
  | "jungle"
  | "violet"
  | "galaxy"
  | "rose"
  | "sunset"
  | "charcoal";

export interface ThemeOption {
  id: ThemeId;
  name: string;
  /** Couleur principale affichée dans le swatch */
  primary: string;
  /** Couleur de fond affichée dans le swatch */
  bg: string;
  /** Icône emoji */
  icon: string;
  /** true = thème sombre */
  dark: boolean;
}

export const THEMES: ThemeOption[] = [
  { id: "sky",      name: "Ciel",     primary: "#3b82f6", bg: "#f0f4ff", icon: "☀️",  dark: false },
  { id: "forest",   name: "Forêt",    primary: "#16a34a", bg: "#f0fdf4", icon: "🌿",  dark: false },
  { id: "violet",   name: "Violet",   primary: "#7c3aed", bg: "#f5f3ff", icon: "💜",  dark: false },
  { id: "rose",     name: "Rose",     primary: "#e11d48", bg: "#fff1f2", icon: "🌹",  dark: false },
  { id: "sunset",   name: "Coucher",  primary: "#ea580c", bg: "#fff7ed", icon: "🌅",  dark: false },
  { id: "dark",     name: "Nuit",     primary: "#6366f1", bg: "#0f1117", icon: "🌙",  dark: true  },
  { id: "midnight", name: "Minuit",   primary: "#38bdf8", bg: "#060d1f", icon: "🌌",  dark: true  },
  { id: "jungle",   name: "Jungle",   primary: "#4ade80", bg: "#041a0e", icon: "🦎",  dark: true  },
  { id: "galaxy",   name: "Galaxie",  primary: "#c084fc", bg: "#09050f", icon: "✨",  dark: true  },
  { id: "charcoal", name: "Charbon",  primary: "#94a3b8", bg: "#111318", icon: "🪨",  dark: true  },
];

interface ThemeStore {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "sky",
      setTheme: (theme) => set({ theme }),
    }),
    { name: "app-theme" }
  )
);

function applyTheme(theme: ThemeId) {
  const root = document.documentElement;
  if (theme === "sky") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }
}

export function useTheme() {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0];
  return { theme, setTheme, themes: THEMES, current };
}
