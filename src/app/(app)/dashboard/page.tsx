"use client";

import { Header } from "@/components/layout/Header";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ActiviteRecente } from "@/components/dashboard/ActiviteRecente";
import { GraphiqueMouvements } from "@/components/dashboard/GraphiqueMouvements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, statutLabels } from "@/components/ui/Badge";
import { useDashboard } from "@/hooks/useDashboard";
import { formatQte } from "@/lib/utils";
import { Boxes, PackagePlus, PackageMinus, AlertTriangle, ShoppingBag, Users, Package } from "lucide-react";

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  const kpis = data?.kpis;
  const activites = data?.activites ?? [];
  const sortiesEnAttente = data?.sortiesEnAttente ?? [];
  const mouvementsGraph = data?.mouvementsGraph ?? [];

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
            unit={`dont ${kpis?.sortiesEnAttenteCount ?? 0} en attente`}
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

        {/* Sorties en attente */}
        <Card className="card-hover">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Sorties en attente de confirmation</CardTitle>
            <span className="text-xs text-text-muted">{sortiesEnAttente.length} en attente</span>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {isLoading ? (
              <p className="py-3.5 text-sm text-text-muted">Chargement…</p>
            ) : sortiesEnAttente.length === 0 ? (
              <p className="py-3.5 text-sm text-text-muted">Aucune sortie en attente</p>
            ) : (
              sortiesEnAttente.map((s) => (
                <div key={s.id} className="flex flex-col gap-3 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                      <Package className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-main">{s.produit}</p>
                      <p className="text-xs text-text-muted">Annoncée par {s.employe} · {s.qte} unités</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pl-13 sm:pl-0">
                    <Badge status="EN_ATTENTE">{statutLabels.EN_ATTENTE}</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
