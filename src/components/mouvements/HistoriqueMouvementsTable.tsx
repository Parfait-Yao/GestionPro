"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Pencil, Check, X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge, statutLabels } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { useEmployes } from "@/hooks/useEmployes";
import { useProduits } from "@/hooks/useProduits";
import { useMouvements, useUpdateMouvement, type Mouvement, type MouvementSens } from "@/hooks/useMouvements";
import { MOTIFS, MOTIF_LABELS } from "@/lib/motifs";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

type ProduitEdit = { produitId: string; quantite: string };

type Edition = {
  employeId: string;
  type: MouvementSens;
  motif: string;
  noteMotif: string;
  produits: ProduitEdit[];
};

export function HistoriqueMouvementsTable() {
  const { data: mouvements = [], isLoading } = useMouvements();
  const { data: employes = [] } = useEmployes();
  const { data: produits = [] } = useProduits();
  const updateMouvement = useUpdateMouvement();

  const [page, setPage] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edition, setEdition] = useState<Edition | null>(null);

  const totalPages = Math.max(1, Math.ceil(mouvements.length / PAGE_SIZE));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (page > totalPages - 1) setPage(0);
  }, [page, totalPages]);

  const pageTabs = useMemo(
    () =>
      Array.from({ length: totalPages }, (_, i) => {
        const start = i * PAGE_SIZE + 1;
        const end = Math.min((i + 1) * PAGE_SIZE, mouvements.length);
        return { value: String(i), label: totalPages > 1 ? `${start}–${end}` : "Tout" };
      }),
    [totalPages, mouvements.length]
  );

  const paginated = mouvements.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  function commencerEdition(m: Mouvement) {
    setEditingId(m.id);
    setEdition({
      employeId: m.employe.id,
      type: m.type,
      motif: m.motif,
      noteMotif: m.noteMotif ?? "",
      produits: m.lignes.map((l) => ({ produitId: l.produit.id, quantite: String(l.quantite) })),
    });
  }

  function annulerEdition() {
    setEditingId(null);
    setEdition(null);
  }

  function updateProduitEdit(index: number, patch: Partial<ProduitEdit>) {
    setEdition((prev) => (prev ? { ...prev, produits: prev.produits.map((p, i) => (i === index ? { ...p, ...patch } : p)) } : prev));
  }

  function ajouterProduitEdit() {
    setEdition((prev) => (prev ? { ...prev, produits: [...prev.produits, { produitId: "", quantite: "" }] } : prev));
  }

  function retirerProduitEdit(index: number) {
    setEdition((prev) => (prev ? { ...prev, produits: prev.produits.filter((_, i) => i !== index) } : prev));
  }

  async function enregistrer(id: string) {
    if (!edition) return;
    const produitsValides = edition.produits.filter((p) => p.produitId && Number(p.quantite) > 0);
    if (!edition.employeId || produitsValides.length === 0) {
      toast.error("Employé et au moins un produit sont requis");
      return;
    }
    try {
      await updateMouvement.mutateAsync({
        id,
        type: edition.type,
        employeId: edition.employeId,
        motif: edition.motif,
        noteMotif: edition.noteMotif,
        lignes: produitsValides.map((p) => ({ produitId: p.produitId, quantite: p.quantite })),
      });
      toast.success("Mouvement modifié");
      annulerEdition();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur lors de la modification");
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-20 text-text-muted">Chargement…</div>;
  }

  if (mouvements.length === 0) {
    return <p className="py-10 text-center text-sm text-text-muted">Aucun mouvement enregistré.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/60 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
              <th className="px-4 py-3">Date / heure</th>
              <th className="px-4 py-3">Employé</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Produits</th>
              <th className="px-4 py-3">Motif</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginated.map((m) => {
              const isEditing = editingId === m.id;
              return (
                <tr key={m.id} className="align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-text-muted">
                    {format(new Date(m.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}
                  </td>

                  <td className="min-w-[160px] px-4 py-3">
                    {isEditing && edition ? (
                      <Select
                        className="h-9 text-xs"
                        value={edition.employeId}
                        onChange={(e) => setEdition({ ...edition, employeId: e.target.value })}
                      >
                        {employes.map((emp) => (
                          <option key={emp.id} value={emp.id}>{emp.prenom} {emp.nom}</option>
                        ))}
                      </Select>
                    ) : (
                      <span>{m.employe.prenom} {m.employe.nom}</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {isEditing && edition ? (
                      <button
                        type="button"
                        onClick={() => setEdition({ ...edition, type: edition.type === "SORTIE" ? "ENTREE" : "SORTIE" })}
                        className={cn(
                          "flex h-9 w-24 items-center justify-center rounded-full text-xs font-semibold text-white",
                          edition.type === "SORTIE" ? "bg-danger" : "bg-success"
                        )}
                      >
                        {edition.type === "SORTIE" ? "Sortie" : "Entrée"}
                      </button>
                    ) : (
                      <span
                        className={cn(
                          "inline-flex h-7 w-20 items-center justify-center rounded-full text-xs font-semibold text-white",
                          m.type === "SORTIE" ? "bg-danger" : "bg-success"
                        )}
                      >
                        {m.type === "SORTIE" ? "Sortie" : "Entrée"}
                      </span>
                    )}
                  </td>

                  <td className="min-w-[220px] px-4 py-3">
                    {isEditing && edition ? (
                      <div className="flex flex-col gap-2">
                        {edition.produits.map((p, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <Select
                              className="h-9 text-xs"
                              value={p.produitId}
                              onChange={(e) => updateProduitEdit(i, { produitId: e.target.value })}
                            >
                              <option value="">Choisir…</option>
                              {produits.map((prod) => (
                                <option key={prod.id} value={prod.id}>{prod.nom}</option>
                              ))}
                            </Select>
                            <input
                              type="number"
                              min={1}
                              value={p.quantite}
                              onChange={(e) => updateProduitEdit(i, { quantite: e.target.value })}
                              className="h-9 w-20 rounded-md border border-border bg-card px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                            />
                            {edition.produits.length > 1 && (
                              <button
                                type="button"
                                onClick={() => retirerProduitEdit(i)}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted hover:bg-danger/10 hover:text-danger"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={ajouterProduitEdit}
                          className="flex items-center gap-1 self-start text-xs font-medium text-accent hover:underline"
                        >
                          <Plus className="h-3 w-3" />Ajouter un produit
                        </button>
                      </div>
                    ) : (
                      <ul className="space-y-1">
                        {m.lignes.map((l) => (
                          <li key={l.id} className="text-text-main">{l.produit.nom} × {l.quantite}</li>
                        ))}
                      </ul>
                    )}
                  </td>

                  <td className="min-w-[180px] px-4 py-3">
                    {isEditing && edition ? (
                      <div className="flex flex-col gap-2">
                        <Select
                          className="h-9 text-xs"
                          value={edition.motif}
                          onChange={(e) => setEdition({ ...edition, motif: e.target.value })}
                        >
                          {MOTIFS.map((mo) => (
                            <option key={mo.value} value={mo.value}>{mo.label}</option>
                          ))}
                        </Select>
                        {edition.motif === "AUTRE" && (
                          <input
                            type="text"
                            placeholder="Précisez le motif…"
                            value={edition.noteMotif}
                            onChange={(e) => setEdition({ ...edition, noteMotif: e.target.value })}
                            className="h-9 w-full rounded-md border border-border bg-card px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                          />
                        )}
                      </div>
                    ) : (
                      <div>
                        <p>{MOTIF_LABELS[m.motif] ?? m.motif}</p>
                        {m.noteMotif && <p className="text-xs text-text-muted">{m.noteMotif}</p>}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <Badge status={m.statut}>{statutLabels[m.statut] ?? m.statut}</Badge>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {isEditing ? (
                        <>
                          <Button size="sm" variant="success" onClick={() => enregistrer(m.id)} loading={updateMouvement.isPending}>
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <button
                            type="button"
                            onClick={annulerEdition}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted hover:bg-surface"
                            aria-label="Annuler"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => commencerEdition(m)}>
                          <Pencil className="h-3.5 w-3.5" />Modifier
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-between">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-text-muted transition-colors hover:bg-surface hover:text-text-main disabled:opacity-30 disabled:hover:bg-card"
            title="Page précédente"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <Tabs tabs={pageTabs} active={String(page)} onChange={(v) => setPage(Number(v))} className="overflow-x-auto" />

          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-text-muted transition-colors hover:bg-surface hover:text-text-main disabled:opacity-30 disabled:hover:bg-card"
            title="Page suivante"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
