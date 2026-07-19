"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Package, Boxes, Search, ImageIcon, Box, ChevronLeft, ChevronRight } from "lucide-react";
import { useProduits } from "@/hooks/useProduits";

const CATEGORY_COLORS: Record<string, string> = {
  "Matière Première":   "bg-amber-50  text-amber-700  border-amber-200",
  "Produit Transformé": "bg-green-50  text-green-700  border-green-200",
  "Consommable":        "bg-blue-50   text-blue-700   border-blue-200",
};

const PAGE_SIZE = 24;

export default function ProduitsPage() {
  const { data: produits = [], isLoading: loading } = useProduits();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const filtered = produits.filter((p) =>
    `${p.nom} ${p.categorie ?? ""}`.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setPage(0);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages - 1) setPage(0);
  }, [page, totalPages]);

  const pageTabs = useMemo(
    () =>
      Array.from({ length: totalPages }, (_, i) => {
        const start = i * PAGE_SIZE + 1;
        const end = Math.min((i + 1) * PAGE_SIZE, filtered.length);
        return { value: String(i), label: totalPages > 1 ? `${start}–${end}` : "Tout" };
      }),
    [totalPages, filtered.length]
  );

  const paginated = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <>
      <Header title="Catalogue produits" subtitle="Références, photos et quantités en stock (lecture seule)" />
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
          <p className="text-sm text-text-muted">{filtered.length} produit{filtered.length !== 1 ? "s" : ""}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-text-muted">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-text-muted">
            <Package className="h-12 w-12 opacity-30" />
            <p className="text-sm">Aucun produit trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {paginated.map((p) => {
              const catColor = CATEGORY_COLORS[p.categorie ?? ""] ?? "bg-gray-50 text-gray-700 border-gray-200";
              const photo = p.imageUrl ?? p.cartonsChine?.find((c) => c.photoUrl)?.photoUrl ?? null;
              return (
                <Card
                  key={p.id}
                  className="card-hover overflow-hidden"
                >
                  {/* Image */}
                  <div className="h-36 bg-gradient-to-br from-surface to-border flex items-center justify-center overflow-hidden relative">
                    {photo ? (
                      <img src={photo} alt={p.nom} className="h-full w-full object-cover" />
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

                    <div className="flex items-center gap-1.5 rounded-lg bg-surface px-3 py-2 text-sm">
                      <Boxes className="h-3.5 w-3.5 text-text-muted" />
                      <span className="text-text-muted text-xs">Quantité en stock</span>
                      <span className="ml-auto font-semibold text-text-main">{p.quantite}</span>
                    </div>

                    {p.cartonsChine && p.cartonsChine.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {p.cartonsChine.map((c) => (
                          <span
                            key={c.id}
                            className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent"
                          >
                            <Box className="h-3 w-3" />
                            {c.identifiant} · {c.commandeChine.reference}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!loading && totalPages > 1 && (
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
    </>
  );
}
