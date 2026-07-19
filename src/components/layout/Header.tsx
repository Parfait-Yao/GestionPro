"use client";

import { Search, RefreshCw, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useSidebar } from "./sidebar-context";
import { NotificationsBell } from "./NotificationsBell";
import { ThemeSwitcher } from "./ThemeSwitcher";


export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const { collapsed, toggleCollapsed, openMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border theme-card backdrop-blur-sm px-4 py-4 sm:px-6" style={{borderColor: 'var(--color-border)'}}>

      {/* Toggle mobile (hamburger) */}
      <button
        onClick={openMobile}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-text-muted hover:bg-border hover:text-text-main transition-colors md:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Toggle desktop (collapse/expand) */}
      <button
        onClick={toggleCollapsed}
        className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-text-muted hover:bg-border hover:text-text-main transition-colors md:flex"
        aria-label={collapsed ? "Étendre le menu" : "Réduire le menu"}
      >
        {collapsed ? (
          <PanelLeftOpen className="h-4 w-4" />
        ) : (
          <PanelLeftClose className="h-4 w-4" />
        )}
      </button>

      {/* Titre */}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-bold text-text-main sm:text-xl tracking-tight">{title}</h1>
        {subtitle && <p className="truncate text-xs text-text-muted mt-0.5 sm:text-sm">{subtitle}</p>}
      </div>

      {/* Actions droite */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="relative hidden lg:block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            placeholder="Rechercher…"
            className="h-10 w-64 rounded-full border border-border bg-surface pl-10 pr-3 text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent/40"
          />
        </div>

        <button className="hidden h-10 items-center gap-1.5 rounded-full border border-border px-3.5 text-sm font-medium text-text-muted hover:bg-surface hover:text-text-main transition-colors sm:flex">
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Actualiser</span>
        </button>

        <ThemeSwitcher />

        <NotificationsBell />

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-light text-sm font-bold text-white shadow-md shadow-accent/20">
          BS
        </div>
      </div>
    </header>
  );
}
