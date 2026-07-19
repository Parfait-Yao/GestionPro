"use client";

import { Header } from "@/components/layout/Header";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ActiviteRecente } from "@/components/dashboard/ActiviteRecente";
import { GraphiqueMouvements } from "@/components/dashboard/GraphiqueMouvements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, statutLabels } from "@/components/ui/Badge";
import { useDashboard } from "@/hooks/useDashboard";
import { formatQte } from "@/lib/utils";
import { Boxes, PackagePlus, PackageMinus, AlertTriangle, ShoppingBag, Users, Package, TrendingDown, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  const kpis = data?.kpis;
  const activites = data?.activites ?? [];
  const mouvementsEscalade = data?.mouvementsEscalade ?? [];
  const mouvementsGraph = data?.mouvementsGraph ?? [];
  const ecartReceptions = data?.ecartReceptions ?? [];

  const totalEcarts = mouvementsEscalade.length + ecartReceptions.length;


  return (
    <>
      <Header title="Bienvenue 👋" subtitle="Voici la synthèse de l'activité du jour" />

      <div className="flex-1 space-y-6 p-4 sm:p-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Stock total"
            value={isLoading ? "…" : formatQte(kpis?.stockTotal ?? 0, "")}
            unit="unités en stock"
            icon={Boxes}
            accent="primary"
          />
          <KpiCard
            label="Commandes ce mois"
            value={isLoading ? "…" : String(kpis?.commandesCeMois ?? 0)}
            unit={`dont ${kpis?.commandesEnAttente ?? 0} en attente`}
            variation={kpis?.commandesVariation}
            icon={ShoppingBag}
            accent="success"
          />
          <KpiCard
            label="Sorties du jour"
            value={isLoading ? "…" : String(kpis?.sortiesDuJour ?? 0)}
            unit={`dont ${kpis?.mouvementsEscaladeCount ?? 0} escaladées`}
            variation={kpis?.sortiesVariation}
            icon={PackageMinus}
            accent="accent"
          />
          <KpiCard
            label="Alertes ouvertes"
            value={isLoading ? "…" : String(kpis?.alertesOuvertes ?? 0)}
            unit="à traiter"
            icon={AlertTriangle}
            accent="danger"
          />
        </div>

        {/* Stats secondaires */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl kpi-primary">
                <PackagePlus className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-main">{isLoading ? "…" : kpis?.receptionsCeMois ?? 0}</p>
                <p className="text-sm text-text-muted">Réceptions ce mois</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl kpi-success">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-main">{isLoading ? "…" : kpis?.employesActifs ?? 0}</p>
                <p className="text-sm text-text-muted">Employés actifs</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl kpi-accent">
                <Boxes className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-main">{isLoading ? "…" : kpis?.produitsCatalogue ?? 0}</p>
                <p className="text-sm text-text-muted">Produits au catalogue</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Graphique + Activité */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-2 card-hover">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Mouvements de stock</CardTitle>
                <p className="text-xs text-text-muted mt-0.5">30 derniers jours</p>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-[260px] items-center justify-center text-text-muted">Chargement…</div>
              ) : (
                <GraphiqueMouvements data={mouvementsGraph} />
              )}
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="text-base">Activité récente</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-text-muted">Chargement…</p>
              ) : activites.length === 0 ? (
                <p className="text-sm text-text-muted">Aucune activité récente</p>
              ) : (
                <ActiviteRecente items={activites} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Écarts signalés à la patronne */}
        <Card className="card-hover">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Écarts signalés à la patronne</CardTitle>
            <span className="text-xs text-text-muted">{totalEcarts} signal{totalEcarts > 1 ? "és" : "é"}</span>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <p className="py-3.5 text-sm text-text-muted">Chargement…</p>
            ) : totalEcarts === 0 ? (
              <p className="py-3.5 text-sm text-text-muted">Aucun écart signalé</p>
            ) : (
              <>
                {/* Sorties escaladées */}
                {mouvementsEscalade.length > 0 && (
                  <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Sorties anormales ({mouvementsEscalade.length})
                    </p>
                    <div className="divide-y divide-border">
                      {mouvementsEscalade.map((m) => (
                        <div key={m.id} className="flex flex-col gap-3 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                              <Package className="h-5 w-5 text-accent" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-text-main">{m.produit}</p>
                              <p className="text-xs text-text-muted">Sortie de {m.employe} · {m.qte} unités</p>
                            </div>
                          </div>
                          <Badge status="ESCALADE_PATRONNE">{statutLabels.ESCALADE_PATRONNE}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Réceptions avec écart */}
                {ecartReceptions.length > 0 && (
                  <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Écarts de réception ({ecartReceptions.length})
                    </p>
                    <div className="divide-y divide-border">
                      {ecartReceptions.map((r) => {
                        const manque = r.ecart < 0;
                        return (
                          <div key={r.id} className="flex flex-col gap-3 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${manque ? "bg-danger/10" : "bg-success/10"}`}>
                                {manque
                                  ? <TrendingDown className="h-5 w-5 text-danger" />
                                  : <TrendingUp className="h-5 w-5 text-success" />
                                }
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-text-main">{r.produit}</p>
                                <p className="text-xs text-text-muted">
                                  Attendu {r.quantiteAttendue} · Reçu {r.quantiteRecue} ·{" "}
                                  <span className={manque ? "text-danger font-medium" : "text-success font-medium"}>
                                    {manque ? `−${Math.abs(r.ecart)}` : `+${r.ecart}`} unités
                                  </span>
                                </p>
                              </div>
                            </div>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${manque ? "bg-danger/10 text-danger" : "bg-success/10 text-success"}`}>
                              {manque ? "Manque" : "Surplus"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

      </div>
    </>
  );
}
