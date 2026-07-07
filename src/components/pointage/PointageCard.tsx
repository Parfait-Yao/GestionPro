"use client";

import { motion } from "framer-motion";
import { LogIn, LogOut, Clock3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const GRADS = [
  "from-primary to-primary-light",
  "from-accent to-accent-light",
  "from-info to-purple-400",
  "from-emerald-500 to-emerald-400",
  "from-warning to-amber-400",
  "from-danger to-rose-400",
];

function initiales(nom: string, prenom: string) {
  return `${prenom[0] ?? ""}${nom[0] ?? ""}`.toUpperCase();
}

export function PointageCard({
  nom,
  prenom,
  roleLabel,
  gradIndex,
  present,
  entreeAt,
  loading,
  onEntree,
  onSortie,
}: {
  nom: string;
  prenom: string;
  roleLabel: string;
  gradIndex: number;
  present: boolean;
  entreeAt: string | null;
  loading: boolean;
  onEntree: () => void;
  onSortie: () => void;
}) {
  const grad = GRADS[gradIndex % GRADS.length];

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 350, damping: 22 }}>
      <Card
        className={cn(
          "overflow-hidden transition-shadow duration-200",
          present ? "ring-1 ring-emerald-500/25" : "hover:shadow-md"
        )}
      >
        <CardContent className="p-0">
          <div className="flex items-center gap-4 p-5">
            <div
              className={cn(
                "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-bold text-white shadow-md",
                grad
              )}
            >
              {initiales(nom, prenom)}
              {present && (
                <span className="absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-card">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-text-main">{prenom} {nom}</p>
              <p className="mt-0.5 text-xs text-text-muted">{roleLabel}</p>
            </div>
          </div>

          <div className="px-5 pb-4">
            {present ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                <Clock3 className="h-3 w-3" />Entré à {entreeAt}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
                Absent
              </span>
            )}
          </div>

          <button
            disabled={loading}
            onClick={present ? onSortie : onEntree}
            className={cn(
              "flex w-full items-center justify-center gap-1.5 border-t border-border py-3 text-sm font-semibold transition-colors disabled:opacity-50",
              present ? "text-accent hover:bg-accent/5" : "text-primary hover:bg-primary/5"
            )}
          >
            {present ? <LogOut className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
            {present ? "Pointer la sortie" : "Pointer l'entrée"}
          </button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
