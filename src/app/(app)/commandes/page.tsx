"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Plus, ShoppingBag, Clock, CheckCircle, Truck, XCircle, Package,
  Search, Phone, MapPin, ChevronRight, Pencil, Trash2,
} from "lucide-react";
import { useCommandes, useDeleteCommande, useUpdateCommandeStatut, type CommandeStatut } from "@/hooks/useCommandes";

const STATUT_CONFIG = {
  EN_ATTENTE:   { label: "En attente",    icon: Clock,         color: "text-amber-600",  bg: "bg-amber-50 border-amber-200"  },
  CONFIRMEE:    { label: "Confirmée",     icon: CheckCircle,   color: "text-blue-600",   bg: "bg-blue-50 border-blue-200"    },
  EN_LIVRAISON: { label: "En livraison",  icon: Truck,         color: "text-primary",    bg: "bg-primary/10 border-primary/20"},
  LIVREE:       { label: "Livrée",        icon: CheckCircle,   color: "text-success",    bg: "bg-green-50 border-green-200"  },
  ANNULEE:      { label: "Annulée",       icon: XCircle,       color: "text-danger",     bg: "bg-red-50 border-red-200"      },
} as const;

type Statut = CommandeStatut;

function StatutBadge({ statut }: { statut: Statut }) {
  const cfg = STATUT_CONFIG[statut];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.color}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

const TABS: { key: "TOUS" | Statut; label: string }[] = [
  { key: "TOUS",         label: "Toutes" },
  { key: "EN_ATTENTE",   label: "En attente" },
  { key: "CONFIRMEE",    label: "Confirmées" },
  { key: "EN_LIVRAISON", label: "En livraison" },
  { key: "LIVREE",       label: "Livrées" },
  { key: "ANNULEE",      label: "Annulées" },
];

export default function CommandesPage() {
  const { data: commandes = [], isLoading: loading } = useCommandes();
  const deleteCommande = useDeleteCommande();
  const updateStatut = useUpdateCommandeStatut();
  const [tab, setTab] = useState<"TOUS" | Statut>("TOUS");
  const [search, setSearch] = useState("");
  const [errMsg, setErrMsg] = useState("");

  function supprimerCommande(id: string, reference: string) {
    if (!window.confirm(`Supprimer définitivement la commande « ${reference} » ?`)) return;
    setErrMsg("");
    deleteCommande.mutate(id, {
      onError: (e) => setErrMsg(e.message),
    });
  }

  const filtered = commandes.filter((c) => {
    const matchTab = tab === "TOUS" || c.statut === tab;
    const matchSearch = `${c.client} ${c.reference} ${c.produit.nom}`.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  function changerStatut(id: string, statut: Statut) {
    updateStatut.mutate({ id, statut });
  }

  const counts = TABS.reduce((acc, t) => {
    acc[t.key] = t.key === "TOUS" ? commandes.length : commandes.filter((c) => c.statut === t.key).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      <Header title="Commandes" subtitle="Suivi des commandes et livraisons" />
      <div className="flex-1 space-y-6 p-4 sm:p-6">

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total", value: commandes.length, icon: ShoppingBag, color: "text-primary bg-primary/10" },
            { label: "En attente", value: counts["EN_ATTENTE"] ?? 0, icon: Clock, color: "text-amber-600 bg-amber-50" },
            { label: "En livraison", value: counts["EN_LIVRAISON"] ?? 0, icon: Truck, color: "text-primary bg-primary/10" },
            { label: "Livrées", value: counts["LIVREE"] ?? 0, icon: CheckCircle, color: "text-success bg-green-50" },
          ].map((s) => (
            <Card key={s.label} className="card-hover">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-text-main">{s.value}</p>
                  <p className="text-xs text-text-muted">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtres */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  tab === t.key
                    ? "bg-primary text-white border-primary"
                    : "bg-card text-text-muted border-border hover:border-primary hover:text-primary"
                }`}
              >
                {t.label}
                {counts[t.key] > 0 && (
                  <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${
                    tab === t.key ? "bg-white/20 text-white" : "bg-border text-text-muted"
                  }`}>
                    {counts[t.key]}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Rechercher…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-card pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Link href="/commandes/nouvelle">
              <Button variant="accent" className="shrink-0">
                <Plus className="h-4 w-4" />Nouvelle commande
              </Button>
            </Link>
          </div>
        </div>

        {errMsg && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errMsg}
          </div>
        )}

        {/* Liste */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-text-muted">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-text-muted">
            <ShoppingBag className="h-12 w-12 opacity-30" />
            <p className="text-sm">Aucune commande trouvée</p>
            <Link href="/commandes/nouvelle">
              <Button variant="accent" size="sm"><Plus className="h-4 w-4" />Créer une commande</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((cmd) => (
              <Card key={cmd.id} className="card-hover overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 p-4">
                    {/* Produit icon */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 overflow-hidden">
                      {cmd.produit.imageUrl ? (
                        <img src={cmd.produit.imageUrl} alt={cmd.produit.nom} className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-6 w-6 text-primary" />
                      )}
                    </div>

                    {/* Infos */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p className="font-semibold text-text-main">{cmd.client}</p>
                          <p className="text-xs text-text-muted">{cmd.produit.nom} · {cmd.quantite} unité{cmd.quantite > 1 ? "s" : ""}</p>
                        </div>
                        <StatutBadge statut={cmd.statut} />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-text-muted">
                        <span className="font-mono">{cmd.reference}</span>
                        {cmd.telephoneClient && (
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{cmd.telephoneClient}</span>
                        )}
                        {cmd.adresseLivraison && (
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{cmd.adresseLivraison}</span>
                        )}
                        {cmd.livreur && (
                          <span className="flex items-center gap-1"><Truck className="h-3 w-3" />{cmd.livreur.prenom} {cmd.livreur.nom}</span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="h-4 w-4 text-text-muted shrink-0" />
                  </div>

                  {/* Actions rapides */}
                  {(cmd.statut === "EN_ATTENTE" || cmd.statut === "CONFIRMEE" || cmd.statut === "EN_LIVRAISON") && (
                    <div className="flex border-t border-border">
                      {cmd.statut === "EN_ATTENTE" && (
                        <button
                          onClick={() => changerStatut(cmd.id, "CONFIRMEE")}
                          className="flex-1 py-2.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <CheckCircle className="inline h-3.5 w-3.5 mr-1" />Confirmer
                        </button>
                      )}
                      {cmd.statut === "CONFIRMEE" && (
                        <button
                          onClick={() => changerStatut(cmd.id, "EN_LIVRAISON")}
                          className="flex-1 py-2.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Truck className="inline h-3.5 w-3.5 mr-1" />Mettre en livraison
                        </button>
                      )}
                      {cmd.statut === "EN_LIVRAISON" && (
                        <button
                          onClick={() => changerStatut(cmd.id, "LIVREE")}
                          className="flex-1 py-2.5 text-xs font-medium text-success hover:bg-green-50 transition-colors"
                        >
                          <CheckCircle className="inline h-3.5 w-3.5 mr-1" />Marquer livrée
                        </button>
                      )}
                      <div className="w-px bg-border" />
                      <button
                        onClick={() => changerStatut(cmd.id, "ANNULEE")}
                        className="px-4 py-2.5 text-xs font-medium text-danger hover:bg-red-50 transition-colors"
                      >
                        <XCircle className="inline h-3.5 w-3.5 mr-1" />Annuler
                      </button>
                    </div>
                  )}

                  {/* Modifier / Supprimer */}
                  <div className="flex border-t border-border">
                    <Link
                      href={`/commandes/${cmd.id}/modifier`}
                      className="flex-1 py-2.5 text-center text-xs font-medium text-text-muted hover:bg-surface transition-colors"
                    >
                      <Pencil className="inline h-3.5 w-3.5 mr-1" />Modifier
                    </Link>
                    <div className="w-px bg-border" />
                    <button
                      onClick={() => supprimerCommande(cmd.id, cmd.reference)}
                      disabled={deleteCommande.isPending && deleteCommande.variables === cmd.id}
                      className="flex-1 py-2.5 text-xs font-medium text-danger hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="inline h-3.5 w-3.5 mr-1" />
                      {deleteCommande.isPending && deleteCommande.variables === cmd.id ? "Suppression…" : "Supprimer"}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
