"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navSections, navItems } from "./nav-items";
import { useSidebar } from "./sidebar-context";
import { Tooltip, TooltipProvider } from "@/components/ui/Tooltip";

const badges: Record<string, number> = { sorties: 3, alertes: 1, commandes: 2 };

// Mémorise, par section, la dernière valeur de badge que l'utilisateur a "vue"
// (en visitant la page correspondante). Le badge ne se réaffiche que si la
// valeur change ensuite (ex: un nouvel élément arrive après la visite).
const SEEN_STORAGE_KEY = "gestionpro-sidebar-badges-seen";

function loadSeenBadges(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(SEEN_STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function SidebarContent({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [seenBadges, setSeenBadges] = useState<Record<string, number>>({});

  useEffect(() => {
    setSeenBadges(loadSeenBadges());
  }, []);

  // Dès qu'on arrive sur une page qui possède un badge, on la marque comme lue.
  useEffect(() => {
    const active = navItems.find((item) => item.badgeKey && pathname?.startsWith(item.href));
    if (!active?.badgeKey) return;
    const key = active.badgeKey;
    const currentValue = badges[key];

    setSeenBadges((prev) => {
      if (prev[key] === currentValue) return prev;
      const next = { ...prev, [key]: currentValue };
      window.localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, [pathname]);

  return (
    <TooltipProvider delayDuration={150}>
    <div className="flex h-full flex-col theme-sidebar border-r border-border">
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-3 border-b border-border px-4 py-5",
          collapsed && "justify-center px-2"
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-light text-white shadow-md shadow-accent/20">
          <Scissors className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div>
            <span className="block text-base font-bold text-text-main leading-tight">GestionPro</span>
            <span className="block text-[10px] text-text-muted uppercase tracking-widest">Salon & Livraison</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {navSections.map((section, si) => (
          <div key={si}>
            {!collapsed && section.title && (
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted/80">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname?.startsWith(item.href);
                const rawBadge = item.badgeKey ? badges[item.badgeKey] : undefined;
                const badge =
                  rawBadge !== undefined && item.badgeKey && seenBadges[item.badgeKey] === rawBadge
                    ? undefined
                    : rawBadge;
                const link = (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 min-h-[42px]",
                      active
                        ? "bg-accent/10 text-accent"
                        : "text-sidebar-text hover:bg-surface hover:text-text-main",
                      collapsed && "justify-center px-0"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0",
                        active ? "text-accent" : "text-sidebar-text"
                      )}
                    />
                    {!collapsed && <span className="flex-1">{item.label}</span>}
                    {!collapsed && badge ? (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[11px] font-bold text-white">
                        {badge}
                      </span>
                    ) : null}
                  </Link>
                );
                return collapsed ? (
                  <Tooltip key={item.href} content={item.label}>
                    {link}
                  </Tooltip>
                ) : (
                  link
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className={cn("border-t border-border p-3", collapsed && "px-2")}>
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl p-2 hover:bg-surface transition-colors",
            collapsed && "justify-center"
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-light text-sm font-bold text-white shadow">
            BS
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text-main">Brou Steven</p>
              <p className="truncate text-xs text-text-muted">Gérant</p>
            </div>
          )}
          <button className="text-text-muted hover:text-text-main transition-colors" title="Déconnexion">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}

export function Sidebar() {
  const { collapsed, mobileOpen, closeMobile } = useSidebar();

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 transition-all duration-200 md:block",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        <SidebarContent collapsed={collapsed} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={closeMobile}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.2 }}
              className="fixed inset-y-0 left-0 z-50 w-72 md:hidden"
            >
              <div className="relative h-full">
                <SidebarContent onNavigate={closeMobile} />
                <button
                  onClick={closeMobile}
                  className="absolute right-3 top-4 text-text-muted hover:text-text-main transition-colors"
                  aria-label="Fermer le menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
