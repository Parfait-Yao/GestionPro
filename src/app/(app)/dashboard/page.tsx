import { Header } from "@/components/layout/Header";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ActiviteRecente } from "@/components/dashboard/ActiviteRecente";
import { GraphiqueMouvements } from "@/components/dashboard/GraphiqueMouvements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, statutLabels } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Boxes, PackagePlus, PackageMinus, AlertTriangle, ShoppingBag, Users, Package } from "lucide-react";

const activites = [
  { id: "1", type: "reception" as const, titre: "Réception validée — Noix de Cajou Brut", detail: "Gérant Brou Steven · 487 / 500 · Pesée · Écart −2.6 %", temps: "il y a 12 min" },
  { id: "2", type: "sortie" as const, titre: "Sortie confirmée — Mangue Séchée", detail: "Gérant Brou Steven · Employée Fatoumata · 50 unités · Vente", temps: "il y a 1 h" },
  { id: "3", type: "alerte" as const, titre: "Alerte écart — Noix de Cajou", detail: "−12 unités · Voir croisement", temps: "il y a 3 h" },
  { id: "4", type: "pointage" as const, titre: "Entrée — Ibrahim Koné", detail: "Pointé par Brou Steven", temps: "il y a 5 h" },
];

const sortiesEnAttente = [
  { id: "s1", produit: "Noix de Cajou Transformée", employe: "Aïcha Coulibaly", qte: 20 },
  { id: "s2", produit: "Mangue Séchée", employe: "Ibrahim Koné", qte: 30 },
  { id: "s3", produit: "Beurre de Karité", employe: "Fatoumata Diarra", qte: 12 },
];

export default function DashboardPage() {
  return (
    <>
      <Header title="Bienvenue, Brou Steven 👋" subtitle="Voici la synthèse de l'activité du jour" />

      <div className="flex-1 space-y-6 p-4 sm:p-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Stock total" value="1 840" unit="unités en stock" variation={4.2} icon={Boxes} accent="primary" />
          <KpiCard label="Commandes ce mois" value="24" unit="dont 2 en attente" variation={12} icon={ShoppingBag} accent="success" />
          <KpiCard label="Sorties du jour" value="5" unit="dont 2 en attente" variation={-2} icon={PackageMinus} accent="accent" />
          <KpiCard label="Alertes ouvertes" value="2" unit="à traiter" icon={AlertTriangle} accent="danger" />
        </div>

        {/* Stats secondaires */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl kpi-primary">
                <PackagePlus className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-main">4</p>
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
                <p className="text-2xl font-bold text-text-main">4</p>
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
                <p className="text-2xl font-bold text-text-main">4</p>
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
              <button className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text-muted hover:bg-surface hover:text-text-main transition-colors">
                Octobre
              </button>
            </CardHeader>
            <CardContent>
              <GraphiqueMouvements />
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="text-base">Activité récente</CardTitle>
            </CardHeader>
            <CardContent>
              <ActiviteRecente items={activites} />
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
            {sortiesEnAttente.map((s) => (
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
                  <Button size="sm" variant="accent">Confirmer</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
