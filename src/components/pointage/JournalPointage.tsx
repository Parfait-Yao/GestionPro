"use client";

import { useState } from "react";
import { Trash2, LogIn, LogOut, Check, X } from "lucide-react";
import { formatDate } from "@/lib/utils";

type JournalEntry = {
  id: string;
  nom: string;
  prenom: string;
  entreeAt: string;
  sortieAt: string | null;
};

function duree(entreeAt: string, sortieAt: string | null) {
  if (!sortieAt) return null;
  const ms = new Date(sortieAt).getTime() - new Date(entreeAt).getTime();
  const h = Math.floor(ms / 3_600_000);
  const m = Math.round((ms % 3_600_000) / 60_000);
  return `${h}h${m.toString().padStart(2, "0")}`;
}

export function JournalPointage({
  entries,
  onDelete,
}: {
  entries: JournalEntry[];
  onDelete: (id: string) => void;
}) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (entries.length === 0) {
    return <p className="py-10 text-center text-sm text-text-muted">Aucun pointage enregistré ce jour-là.</p>;
  }

  return (
    <div className="divide-y divide-border">
      {entries.map((e) => (
        <div key={e.id} className="flex flex-wrap items-center gap-3 py-3 text-sm first:pt-0 last:pb-0">
          <span className="min-w-[10rem] font-medium text-text-main">{e.prenom} {e.nom}</span>

          <span className="flex items-center gap-1 text-emerald-600">
            <LogIn className="h-3.5 w-3.5" />
            {formatDate(e.entreeAt, "HH:mm")}
          </span>

          {e.sortieAt ? (
            <span className="flex items-center gap-1 text-accent">
              <LogOut className="h-3.5 w-3.5" />
              {formatDate(e.sortieAt, "HH:mm")}
            </span>
          ) : (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">En cours</span>
          )}

          {duree(e.entreeAt, e.sortieAt) && (
            <span className="text-xs text-text-muted">· {duree(e.entreeAt, e.sortieAt)}</span>
          )}

          <div className="ml-auto flex items-center gap-2">
            {confirmId === e.id ? (
              <>
                <button
                  onClick={() => { onDelete(e.id); setConfirmId(null); }}
                  className="flex items-center gap-1 rounded-lg bg-danger px-2.5 py-1.5 text-xs font-medium text-white hover:bg-danger/90 transition-colors"
                >
                  <Check className="h-3.5 w-3.5" />Confirmer
                </button>
                <button
                  onClick={() => setConfirmId(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-muted hover:bg-surface transition-colors"
                  aria-label="Annuler"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirmId(e.id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-danger/10 hover:text-danger transition-colors"
                aria-label="Supprimer ce pointage"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
