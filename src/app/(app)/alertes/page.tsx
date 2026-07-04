"use client";

import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, statutLabels } from "@/components/ui/Badge";
import { useAlertes } from "@/hooks/useAlertes";
import { formatDate } from "@/lib/utils";
import { AlertTriangle, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function AlertesPage() {
  const { data, isLoading } = useAlertes();
  const alertes = data?.alertes ?? [];
  const stats = data?.stats ?? { ouvertes: 0, enCours: 0, resoluesCeMois: 0 };

  return (
    <>
      <Header title="Alertes & écarts" subtitle="Croisement présences / mouvements de stock" />
      <div className="flex-1 space-y-6 p-4 sm:p-6">

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50"><ShieldAlert className="h-6 w-6 text-red-600" /></div>
              <div><p className="text-2xl font-bold text-text-main">{isLoading ? "…" : stats.ouvertes}</p><p className="text-sm text-text-muted">Alertes ouvertes</p></div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50"><AlertTriangle className="h-6 w-6 text-amber-600" /></div>
              <div><p className="text-2xl font-bold text-text-main">{isLoading ? "…" : stats.enCours}</p><p className="text-sm text-text-muted">En cours</p></div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50"><CheckCircle2 className="h-6 w-6 text-emerald-600" /></div>
              <div><p className="text-2xl font-bold text-text-main">{isLoading ? "…" : stats.resoluesCeMois}</p><p className="text-sm text-text-muted">Résolues ce mois</p></div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-text-muted">Chargement…</div>
        ) : alertes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-text-muted">
            <ShieldAlert className="h-12 w-12 opacity-30" />
            <p className="text-sm">Aucune alerte pour le moment</p>
          </div>
        ) : (
          alertes.map((a) => (
            <Card key={a.id} className="card-hover overflow-hidden">
              <CardHeader className="flex flex-col gap-4 pb-5 sm:flex-row sm:items-start sm:justify-between sm:pb-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-400 text-white shadow-md">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Écart détecté — {a.produit ?? "Produit inconnu"}</CardTitle>
                    <p className="text-sm text-text-muted mt-1">
                      Quantité manquante : {a.ecartQuantite} unités · Période {formatDate(a.periodeDebut, "dd MMM")} → {formatDate(a.periodeFin, "dd MMM")}
                    </p>
                  </div>
                </div>
                <Badge status={a.statut} className="shrink-0">{statutLabels[a.statut] ?? a.statut}</Badge>
              </CardHeader>
              <CardContent className="space-y-2 border-t border-border pt-5">
                <p className="text-sm text-text-main">
                  Gérant en poste : <span className="font-semibold">{a.gerantEnPoste}</span>
                </p>
                {a.resolueAt && (
                  <p className="text-xs text-text-muted">Résolue le {formatDate(a.resolueAt)}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
