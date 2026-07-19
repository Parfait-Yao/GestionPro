"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useEmployes } from "@/hooks/useEmployes";
import { useProduits } from "@/hooks/useProduits";
import { useCreateMouvement, type MouvementSens } from "@/hooks/useMouvements";
import { MOTIFS_SORTIE, MOTIFS_ENTREE } from "@/lib/motifs";
import { cn } from "@/lib/utils";

type ProduitLigne = { produitId: string; quantite: string };

type LigneBrouillon = {
  type: MouvementSens;
  produits: ProduitLigne[];
  motif: string;
  noteMotif: string;
};

function ligneVide(): LigneBrouillon {
  return {
    type: "SORTIE",
    produits: [{ produitId: "", quantite: "" }],
    motif: "VENTE",
    noteMotif: "",
  };
}

export function SaisieMouvementsTable() {
  const { data: employes = [] } = useEmployes();
  const { data: produits = [] } = useProduits();
  const createMouvement = useCreateMouvement();

  const employesActifs = useMemo(
    () => employes.filter((e) => e.actif).sort((a, b) => `${a.prenom} ${a.nom}`.localeCompare(`${b.prenom} ${b.nom}`)),
    [employes]
  );

  const [lignes, setLignes] = useState<Record<string, LigneBrouillon>>({});
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  function ligneDe(employeId: string): LigneBrouillon {
    return lignes[employeId] ?? ligneVide();
  }

  function updateLigne(employeId: string, patch: Partial<LigneBrouillon>) {
    setLignes((prev) => ({ ...prev, [employeId]: { ...ligneDe(employeId), ...patch } }));
  }

  function updateProduitLigne(employeId: string, index: number, patch: Partial<ProduitLigne>) {
    setLignes((prev) => ({
      ...prev,
      [employeId]: {
        ...ligneDe(employeId),
        produits: ligneDe(employeId).produits.map((p, i) => (i === index ? { ...p, ...patch } : p)),
      },
    }));
  }

  function ajouterProduit(employeId: string) {
    setLignes((prev) => ({
      ...prev,
      [employeId]: { ...ligneDe(employeId), produits: [...ligneDe(employeId).produits, { produitId: "", quantite: "" }] },
    }));
  }

  function retirerProduit(employeId: string, index: number) {
    setLignes((prev) => ({
      ...prev,
      [employeId]: { ...ligneDe(employeId), produits: ligneDe(employeId).produits.filter((_, i) => i !== index) },
    }));
  }

  async function confirmer(employeId: string) {
    const ligne = ligneDe(employeId);
    const produitsValides = ligne.produits.filter((p) => p.produitId && Number(p.quantite) > 0);
    if (produitsValides.length === 0) {
      toast.error("Sélectionnez au moins un produit avec une quantité");
      return;
    }
    if (ligne.motif === "AUTRE" && !ligne.noteMotif.trim()) {
      toast.error("Précisez le motif « Autre »");
      return;
    }

    setConfirmingId(employeId);
    try {
      await createMouvement.mutateAsync({
        type: ligne.type,
        employeId,
        motif: ligne.motif,
        noteMotif: ligne.noteMotif,
        lignes: produitsValides.map((p) => ({ produitId: p.produitId, quantite: p.quantite })),
      });
      toast.success(ligne.type === "ENTREE" ? "Entrée enregistrée" : "Sortie enregistrée");
      setLignes((prev) => ({ ...prev, [employeId]: ligneVide() }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur lors de l'enregistrement");
    } finally {
      setConfirmingId(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full min-w-[900px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-surface/60 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
            <th className="px-4 py-3">Employé</th>
            <th className="px-4 py-3">Produit(s)</th>
            <th className="px-4 py-3">Quantité</th>
            <th className="px-4 py-3">Motif</th>
            <th className="px-4 py-3">Entrée / Sortie</th>
            <th className="px-4 py-3 text-right">Confirmer</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {employesActifs.map((emp) => {
            const ligne = ligneDe(emp.id);
            return (
              <tr key={emp.id} className="align-top">
                <td className="min-w-[160px] px-4 py-3 font-medium text-text-main">
                  {emp.prenom} {emp.nom}
                </td>

                <td className="min-w-[220px] px-4 py-3">
                  <div className="flex flex-col gap-2">
                    {ligne.produits.map((p, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <Select
                          className="h-9 text-xs"
                          value={p.produitId}
                          onChange={(e) => updateProduitLigne(emp.id, i, { produitId: e.target.value })}
                        >
                          <option value="">Choisir…</option>
                          {produits.map((prod) => (
                            <option key={prod.id} value={prod.id}>{prod.nom}</option>
                          ))}
                        </Select>
                        {ligne.produits.length > 1 && (
                          <button
                            type="button"
                            onClick={() => retirerProduit(emp.id, i)}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted hover:bg-danger/10 hover:text-danger"
                            aria-label="Retirer ce produit"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => ajouterProduit(emp.id)}
                      className="flex items-center gap-1 self-start text-xs font-medium text-accent hover:underline"
                    >
                      <Plus className="h-3 w-3" />Ajouter un produit
                    </button>
                  </div>
                </td>

                <td className="min-w-[110px] px-4 py-3">
                  <div className="flex flex-col gap-2">
                    {ligne.produits.map((p, i) => (
                      <input
                        key={i}
                        type="number"
                        min={1}
                        placeholder="Qté"
                        value={p.quantite}
                        onChange={(e) => updateProduitLigne(emp.id, i, { quantite: e.target.value })}
                        className="h-9 w-full rounded-md border border-border bg-card px-2 text-xs text-text-main focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    ))}
                  </div>
                </td>

                <td className="min-w-[180px] px-4 py-3">
                  <div className="flex flex-col gap-2">
                    <Select
                      className="h-9 text-xs"
                      value={ligne.motif}
                      onChange={(e) => updateLigne(emp.id, { motif: e.target.value })}
                    >
                      {(ligne.type === "SORTIE" ? MOTIFS_SORTIE : MOTIFS_ENTREE).map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </Select>
                    {ligne.motif === "AUTRE" && (
                      <input
                        type="text"
                        placeholder="Précisez le motif…"
                        value={ligne.noteMotif}
                        onChange={(e) => updateLigne(emp.id, { noteMotif: e.target.value })}
                        className="h-9 w-full rounded-md border border-border bg-card px-2 text-xs text-text-main focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    )}
                  </div>
                </td>

                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => {
                      const nextType = ligne.type === "SORTIE" ? "ENTREE" : "SORTIE";
                      updateLigne(emp.id, {
                        type: nextType,
                        // Forcer le motif cohérent avec le nouveau type
                        motif: nextType === "ENTREE" ? "CORRECTION_INVENTAIRE" : "VENTE",
                      });
                    }}
                    className={cn(
                      "flex h-9 w-24 items-center justify-center rounded-full text-xs font-semibold text-white transition-colors",
                      ligne.type === "SORTIE" ? "bg-danger hover:bg-danger/90" : "bg-success hover:bg-success/90"
                    )}
                  >
                    {ligne.type === "SORTIE" ? "Sortie" : "Entrée"}
                  </button>
                </td>

                <td className="px-4 py-3 text-right">
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => confirmer(emp.id)}
                    loading={confirmingId === emp.id}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
