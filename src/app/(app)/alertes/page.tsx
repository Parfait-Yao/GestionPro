import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, statutLabels } from "@/components/ui/Badge";
import { CroisementTimeline } from "@/components/alertes/CroisementTimeline";
import { AlertTriangle, Video, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function AlertesPage() {
  return (
    <>
      <Header title="Alertes & écarts" subtitle="Croisement présences / mouvements de stock" />
      <div className="flex-1 space-y-6 p-4 sm:p-6">

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50"><ShieldAlert className="h-6 w-6 text-red-600" /></div>
              <div><p className="text-2xl font-bold text-text-main">1</p><p className="text-sm text-text-muted">Alertes ouvertes</p></div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50"><AlertTriangle className="h-6 w-6 text-amber-600" /></div>
              <div><p className="text-2xl font-bold text-text-main">0</p><p className="text-sm text-text-muted">En cours</p></div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50"><CheckCircle2 className="h-6 w-6 text-emerald-600" /></div>
              <div><p className="text-2xl font-bold text-text-main">6</p><p className="text-sm text-text-muted">Résolues ce mois</p></div>
            </CardContent>
          </Card>
        </div>

        <Card className="card-hover overflow-hidden">
          <CardHeader className="flex flex-col gap-4 pb-5 sm:flex-row sm:items-start sm:justify-between sm:pb-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-400 text-white shadow-md">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Écart détecté — Câble USB-C</CardTitle>
                <p className="text-sm text-text-muted mt-1">Quantité manquante : −15 unités · Période probable 30 Jun → 02 Jul</p>
              </div>
            </div>
            <Badge status="OUVERTE" className="shrink-0">{statutLabels.OUVERTE}</Badge>
          </CardHeader>
          <CardContent className="space-y-5 border-t border-border pt-5">
            <p className="text-sm text-text-main">
              Gérant en poste : <span className="font-semibold">Aya Kouamé</span>
            </p>
            <CroisementTimeline
              creneaux={[
                { employe: "Séraphin K.", debut: 9, fin: 11.5, suspect: true },
                { employe: "Marc T.", debut: 14, fin: 14.75, suspect: false },
              ]}
            />
            <div className="flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/10 p-3 text-sm text-primary">
              <Video className="h-4 w-4 shrink-0" />
              Restreindre le visionnage caméra au créneau 09h00–11h30 le 01 Jul.
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
