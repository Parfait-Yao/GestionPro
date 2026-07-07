"use client";

import { useState } from "react";
import { ImageIcon, ListFilter } from "lucide-react";
import { formatQte } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { MOTIF_ICON } from "@/lib/motifs";

export type MotifQuantite = { motif: string; quantite: number };

export type LigneStock = {
  id: string;
  cartonLabel: string;
  produitId: string;
  produitNom: string;
  produitPhoto: string | null;
  quantiteRecue: number;
  quantiteRestante: number;
  motifs: MotifQuantite[];
};

function Photo({ url, nom }: { url: string | null; nom: string }) {
  return (
    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-surface flex items-center justify-center">
      {url ? (
        <img src={url} alt={nom} className="h-full w-full object-cover" />
      ) : (
        <ImageIcon className="h-4 w-4 text-text-muted/40" />
      )}
    </div>
  );
}

function MotifsCell({ row, onClick }: { row: LigneStock; onClick: () => void }) {
  const total = row.motifs.reduce((s, m) => s + m.quantite, 0);

  if (row.motifs.length === 0) {
    return <span className="text-xs text-text-muted">Aucune sortie</span>;
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-text-main transition-colors hover:border-primary hover:bg-primary/5"
    >
      <ListFilter className="h-3.5 w-3.5 text-text-muted" />
      {row.motifs.length} motif{row.motifs.length > 1 ? "s" : ""} · {formatQte(total)}
    </button>
  );
}

function MotifsModal({ row, onClose }: { row: LigneStock | null; onClose: () => void }) {
  return (
    <Modal
      open={row !== null}
      onClose={onClose}
      title={row ? `${row.produitNom} — ${row.cartonLabel}` : ""}
    >
      <div className="space-y-2">
        {row?.motifs.map((m) => {
          const info = MOTIF_ICON[m.motif] ?? MOTIF_ICON.AUTRE;
          const MIcon = info.icon;
          return (
            <div
              key={m.motif}
              className="flex items-center gap-3 rounded-xl border border-border p-3"
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${info.bg}`}>
                <MIcon className={`h-4 w-4 ${info.text}`} />
              </div>
              <span className="flex-1 font-medium text-text-main">{info.label}</span>
              <span className="font-semibold text-text-main">{formatQte(m.quantite)}</span>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

export function TableauStock({ data }: { data: LigneStock[] }) {
  const [selected, setSelected] = useState<LigneStock | null>(null);

  return (
    <>
      {/* Desktop / tablette */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs font-medium uppercase tracking-wide text-text-muted">
              <th className="py-3 pr-4">Carton</th>
              <th className="px-3 py-3">Produit</th>
              <th className="px-3 py-3">Quantité reçue</th>
              <th className="px-3 py-3">Quantité restante</th>
              <th className="px-3 py-3">Motifs</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0 hover:bg-surface">
                <td className="py-3 pr-4 font-medium text-text-main">{row.cartonLabel}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <Photo url={row.produitPhoto} nom={row.produitNom} />
                    <span className="font-semibold text-text-main">{row.produitNom}</span>
                  </div>
                </td>
                <td className="px-3 py-3">{formatQte(row.quantiteRecue)}</td>
                <td className="px-3 py-3">{formatQte(row.quantiteRestante)}</td>
                <td className="px-3 py-3">
                  <MotifsCell row={row} onClick={() => setSelected(row)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="space-y-3 md:hidden">
        {data.map((row) => (
          <div key={row.id} className="rounded-md border border-border p-3">
            <div className="flex items-center gap-3">
              <Photo url={row.produitPhoto} nom={row.produitNom} />
              <div>
                <p className="font-semibold text-text-main">{row.produitNom}</p>
                <p className="text-xs text-text-muted">{row.cartonLabel}</p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-muted">
              <span>Reçue : <span className="font-medium text-text-main">{formatQte(row.quantiteRecue)}</span></span>
              <span>Restante : <span className="font-medium text-text-main">{formatQte(row.quantiteRestante)}</span></span>
            </div>
            <div className="mt-2">
              <MotifsCell row={row} onClick={() => setSelected(row)} />
            </div>
          </div>
        ))}
      </div>

      <MotifsModal row={selected} onClose={() => setSelected(null)} />
    </>
  );
}
