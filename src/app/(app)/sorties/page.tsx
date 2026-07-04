"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Badge, statutLabels } from "@/components/ui/Badge";
import {
  Plus, User, Package, PackageMinus, Clock, CheckCircle2, AlertTriangle, ShieldAlert,
  ShoppingCart, Factory, Home, Wrench, MoreHorizontal, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MOTIF_ICON: Record<string, { label: string; icon: LucideIcon; bg: string; text: string }> = {
  VENTE:                    { label: "Vente",                    icon: ShoppingCart,   bg: "bg-emerald-50", text: "text-emerald-600" },
  TRANSFORMATION:           { label: "Transformation",           icon: Factory,        bg: "bg-accent/10",  text: "text-accent" },
  USAGE_INTERNE:            { label: "Usage interne",            icon: Home,           bg: "bg-info/10",    text: "text-info" },
  REMPLACEMENT_DEFECTUEUX:  { label: "Remplacement défectueux",  icon: Wrench,         bg: "bg-amber-50",   text: "text-amber-600" },
  AUTRE:                    { label: "Autre",                    icon: MoreHorizontal, bg: "bg-slate-100",  text: "text-slate-600" },
};

type Sortie = {
  id: string;
  produit: { nom: string; seuilSensibleQte: number };
  employe: { nom: string; prenom: string };
  motif: string;
  quantiteAnnoncee: number;
  statut: string;
};

function ConfirmationSortie({ sortie, onConfirmed }: { sortie: Sortie; onConfirmed: (s: Sortie) => void }) {
  const [ouvert, setOuvert] = useState(false);
  const [quantite, setQuantite] = useState(String(sortie.quantiteAnnoncee));
  const [envoi, setEnvoi] = useState(false);

  const q = parseInt(quantite || "0", 10);
  const ecart = q - sortie.quantiteAnnoncee;
  const escalade = q > sortie.produit.seuilSensibleQte;

  async function confirmer() {
    setEnvoi(true);
    try {
      const res = await fetch(`/api/sorties/${sortie.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantiteConfirmee: q }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur lors de la confirmation");
        return;
      }
      toast.success(data.statut === "ESCALADE_PATRONNE" ? "Écart important — la patronne est notifiée" : "Sortie confirmée — stock décrémenté");
      onConfirmed(data);
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="border-t border-border">
      <div className="flex items-center justify-between px-5 py-3">
        <span className="text-xs text-text-muted">Confirmer la sortie</span>
        <Switch checked={ouvert} onChange={setOuvert} />
      </div>

      {ouvert && (
        <div className="space-y-3 border-t border-border bg-surface/60 px-5 py-4">
          <label className="block text-xs font-medium text-text-muted">
            Quantité réellement constatée
            <input
              type="number"
              value={quantite}
              onChange={(e) => setQuantite(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </label>

          {ecart !== 0 && (
            <div className={cn("flex items-center gap-2 rounded-md p-2.5 text-xs font-medium", ecart < 0 ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning")}>
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              Écart constaté : {ecart > 0 ? "+" : ""}{ecart} unités
            </div>
          )}

          {escalade && (
            <div className="flex items-center gap-2 rounded-md bg-accent/10 p-2.5 text-xs font-medium text-accent">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
              Seuil dépassé — la patronne sera notifiée pour validation à distance.
            </div>
          )}

          <Button size="sm" className="w-full" onClick={confirmer} loading={envoi}>
            <CheckCircle2 className="h-4 w-4" />
            Valider la confirmation
          </Button>
        </div>
      )}
    </div>
  );
}

export default function SortiesPage() {
  const [sorties, setSorties] = useState<Sortie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sorties")
      .then((r) => r.json())
      .then((d) => { setSorties(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const enAttente = sorties.filter((s) => s.statut === "EN_ATTENTE").length;
  const confirmees = sorties.filter((s) => s.statut === "CONFIRMEE" || s.statut === "ESCALADE_PATRONNE").length;

  function confirmerSortie(updated: Sortie) {
    setSorties((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }

  return (
    <>
      <Header title="Sorties de stock" subtitle="Annonce puis confirmation par le gérant" />
      <div className="flex-1 space-y-6 p-4 sm:p-6">

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <PackageMinus className="h-6 w-6 text-primary" />
              </div>
              <div><p className="text-2xl font-bold text-text-main">{sorties.length}</p><p className="text-sm text-text-muted">Total sorties</p></div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div><p className="text-2xl font-bold text-text-main">{enAttente}</p><p className="text-sm text-text-muted">En attente</p></div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <div><p className="text-2xl font-bold text-text-main">{confirmees}</p><p className="text-sm text-text-muted">Confirmées</p></div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Link href="/sorties/nouvelle">
            <Button variant="accent"><Plus className="h-4 w-4" />Annoncer une sortie</Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-text-muted">Chargement…</div>
        ) : sorties.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-text-muted">
            <PackageMinus className="h-12 w-12 opacity-30" />
            <p className="text-sm">Aucune sortie enregistrée</p>
            <Link href="/sorties/nouvelle">
              <Button variant="accent" size="sm"><Plus className="h-4 w-4" />Annoncer une sortie</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {sorties.map((s) => {
              const m = MOTIF_ICON[s.motif] ?? MOTIF_ICON.AUTRE;
              const MIcon = m.icon;
              return (
                <Card key={s.id} className="card-hover overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-start gap-4 p-5">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${m.bg}`}>
                        <MIcon className={`h-6 w-6 ${m.text}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-text-main truncate">{s.produit.nom}</p>
                        <p className="flex items-center gap-1.5 text-xs text-text-muted mt-0.5">
                          <User className="h-3 w-3" />{s.employe.prenom} {s.employe.nom} · {m.label}
                        </p>
                        <div className="mt-2">
                          <Badge status={s.statut}>{statutLabels[s.statut]}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border px-5 py-3 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-text-muted">
                        <Package className="h-3.5 w-3.5" />Quantité annoncée
                      </span>
                      <span className="font-semibold text-text-main">{s.quantiteAnnoncee}</span>
                    </div>

                    {s.statut === "EN_ATTENTE" ? (
                      <ConfirmationSortie sortie={s} onConfirmed={confirmerSortie} />
                    ) : (
                      <div className="flex items-center gap-1.5 border-t border-border px-5 py-3 text-xs font-medium text-success">
                        <CheckCircle2 className="h-3.5 w-3.5" />Sortie confirmée
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
