"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/hooks/useTheme";

/** Applique le thème sauvegardé dès le premier rendu côté client (évite le FOUC). */
export function ThemeInitializer() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "sky") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }
  }, [theme]);

  return null;
}
