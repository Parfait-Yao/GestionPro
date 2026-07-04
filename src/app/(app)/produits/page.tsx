"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Package, Scale, Tag, Search, ImageIcon, Pencil, Trash2 } from "lucide-react";
import { useProduits, useDeleteProduit } from "@/hooks/useProduits";

const CATEGORY_COLORS: Record<string, string> = {
  "Matière Première":   "bg-amber-50  text-amber-700  border-amber-200",
  "Produit Transformé": "bg-green-50  text-green-700  border-green-200",
  "Consommable":        "bg-blue-50   text-blue-700   border-blue-200",
};

export default function ProduitsPage() {
  const { data: produits = [], isLoading: loading } = useProduits();
  const deleteProduit = useDeleteProduit();
  const [search, setSearch] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const filtered = produits.filter((p) =>
    `${p.nom} ${p.categorie ?? ""}`.toLowerCase().includes(search.toLowerCase())
  );

  function supprimerProduit(id: string, nom: string) {
    if (!window.confirm(`Supprimer définitivement « ${nom} » ?`)) return;
    setErrMsg("");
    deleteProduit.mutate(id, {
      onError: (e) => setErrMsg(e.message),
    });
  }

  return (
    <>
      <Header title="Catalogue produits" subtitle="Références, photos et seuils de tolérance" />
      <div className="flex-1 space-y-4 p-4 sm:p-6">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Rechercher un produit…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-card pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Link href="/produits/nouveau">
            <Button variant="accent"><Plus className="h-4 w-4" />Nouveau produit</Button>
          </Link>
        </div>

        {errMsg && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errMsg}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-text-muted">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-text-muted">
            <Package className="h-12 w-12 opacity-30" />
            <p className="text-sm">Aucun produit trouvé</p>
            <Link href="/produits/nouveau">
              <Button variant="accent" size="sm"><Plus className="h-4 w-4" />Ajouter un produit</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => {
              const catColor = CATEGORY_COLORS[p.categorie ?? ""] ?? "bg-gray-50 text-gray-700 border-gray-200";
              return (
                <Card
                  key={p.id}
                  className="card-hover overflow-hidden"
                >
                  {/* Image */}
                  <div className="h-36 bg-gradient-to-br from-surface to-border flex items-center justify-center overflow-hidden relative">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.nom} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-text-muted/40">
                        <ImageIcon className="h-10 w-10" />
                        <span className="text-xs">Aucune photo</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex flex-col items-end gap-1.5">
                      {p.categorie && (
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${catColor}`}>
                          {p.categorie}
                        </span>
                      )}
                    </div>
                  </div>

                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Package className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-text-main">{p.nom}</p>
                        {p.description && <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{p.description}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1.5 rounded-lg bg-surface px-3 py-2 text-sm">
                        <Scale className="h-3.5 w-3.5 text-text-muted" />
                        <span className="text-text-muted text-xs">Tolérance</span>
                        <span className="ml-auto font-semibold text-text-main">{p.seuilTolerancePct}%</span>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-lg bg-surface px-3 py-2 text-sm">
                        <Tag className="h-3.5 w-3.5 text-text-muted" />
                        <span className="text-text-muted text-xs">Seuil</span>
                        <span className="ml-auto font-semibold text-text-main">{p.seuilSensibleQte}</span>
                      </div>
                    </div>
                  </CardContent>

                  <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
                    <Link href={`/produits/${p.id}/modifier`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-3.5 w-3.5" />Modifier
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={deleteProduit.isPending && deleteProduit.variables === p.id}
                      onClick={() => supprimerProduit(p.id, p.nom)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />Supprimer
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
