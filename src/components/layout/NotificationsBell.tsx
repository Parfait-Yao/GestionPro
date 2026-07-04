"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, Check, X, ShoppingBag, PackageCheck, Package, UserPlus, AlertTriangle, Inbox,
} from "lucide-react";
import { cn, formatRelative } from "@/lib/utils";

type Notification = {
  id: string;
  type: "commande" | "reception" | "produit" | "employe" | "alerte";
  titre: string;
  message: string;
  lien: string | null;
  lue: boolean;
  createdAt: string;
};

const TYPE_CONFIG = {
  commande: { icon: ShoppingBag, color: "bg-accent/10 text-accent" },
  reception: { icon: PackageCheck, color: "bg-success/10 text-success" },
  produit: { icon: Package, color: "bg-primary/10 text-primary" },
  employe: { icon: UserPlus, color: "bg-accent/10 text-accent" },
  alerte: { icon: AlertTriangle, color: "bg-danger/10 text-danger" },
} satisfies Record<Notification["type"], { icon: typeof Bell; color: string }>;

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [nonLues, setNonLues] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function charger() {
      fetch("/api/notifications")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!data) return;
          setNotifications(data.notifications);
          setNonLues(data.nonLues);
        })
        .catch(() => {
          // silencieux : la cloche reste dans son dernier état connu
        });
    }
    charger();
    const interval = setInterval(charger, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function marquerLue(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, lue: true } : n)));
    setNonLues((prev) => {
      const n = notifications.find((n) => n.id === id);
      return n && !n.lue ? Math.max(0, prev - 1) : prev;
    });
    try {
      await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    } catch {
      // best-effort
    }
  }

  async function marquerToutesLues() {
    setNotifications((prev) => prev.map((n) => ({ ...n, lue: true })));
    setNonLues(0);
    try {
      await fetch("/api/notifications", { method: "PATCH" });
    } catch {
      // best-effort
    }
  }

  async function supprimer(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    const cible = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (cible && !cible.lue) setNonLues((prev) => Math.max(0, prev - 1));
    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    } catch {
      // best-effort
    }
  }

  function onItemClick(n: Notification) {
    if (!n.lue) marquerLue(n.id);
    setOpen(false);
    if (n.lien) router.push(n.lien);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-text-muted hover:bg-surface hover:text-text-main transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {nonLues > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white ring-2 ring-card">
            {nonLues > 9 ? "9+" : nonLues}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-border bg-card card-shadow sm:w-96">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-text-main">Notifications</p>
            {nonLues > 0 && (
              <button
                onClick={marquerToutesLues}
                className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-light transition-colors"
              >
                <Check className="h-3.5 w-3.5" />
                Tout marquer comme lu
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <Inbox className="h-8 w-8 text-text-muted" />
                <p className="text-sm text-text-muted">Aucune notification pour le moment</p>
              </div>
            ) : (
              notifications.map((n) => {
                const cfg = TYPE_CONFIG[n.type];
                const Icon = cfg.icon;
                return (
                  <div
                    key={n.id}
                    onClick={() => onItemClick(n)}
                    className={cn(
                      "group flex cursor-pointer items-start gap-3 border-b border-border/60 px-4 py-3 last:border-b-0 hover:bg-surface transition-colors",
                      !n.lue && "bg-accent/[0.04]"
                    )}
                  >
                    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", cfg.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {!n.lue && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
                        <p className="truncate text-sm font-semibold text-text-main">{n.titre}</p>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-text-muted">{n.message}</p>
                      <p className="mt-1 text-[11px] text-text-muted">{formatRelative(n.createdAt)}</p>
                    </div>
                    <button
                      onClick={(e) => supprimer(n.id, e)}
                      className="shrink-0 rounded-lg p-1 text-text-muted opacity-0 hover:bg-border hover:text-danger group-hover:opacity-100 transition-all"
                      aria-label="Supprimer la notification"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
