"use client";

import { LogIn, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

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
    <Card className="card-hover overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center gap-4 p-5">
          <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${grad} text-sm font-bold text-white shadow-md`}>
            {initiales(nom, prenom)}
            {present && (
              <span className="absolute -right-1 -bottom-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-card" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-text-main truncate">{prenom} {nom}</p>
            <p className="text-xs text-text-muted mt-0.5">{roleLabel}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
              present ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500"
            }`}
          >
            {present ? `Entré à ${entreeAt}` : "Absent"}
          </span>
        </div>
        <button
          disabled={loading}
          onClick={present ? onSortie : onEntree}
          className={`flex w-full items-center justify-center gap-1.5 border-t border-border py-3 text-sm font-semibold transition-colors disabled:opacity-50 ${
            present ? "text-accent hover:bg-accent/5" : "text-primary hover:bg-primary/5"
          }`}
        >
          {present ? <LogOut className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
          {present ? "Pointer la sortie" : "Pointer l'entrée"}
        </button>
      </CardContent>
    </Card>
  );
}
