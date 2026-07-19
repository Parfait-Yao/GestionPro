"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Plus, PackagePlus, CheckCircle2, AlertTriangle,
  Box, Package, Ship, ArrowUpRight, ArrowDownRight, Check, ImageIcon,
} from "lucide-react";
import { formatDate, libelleEcart } from "@/lib/utils";

type Reception = {
  id: string;
  produit: { nom: string; imageUrl: string | null };
  gerant: { nom: string; prenom: string };
  commandeChine: { id: string; reference: string } | null;
  cartonChine: { id: string; identifiant: string; photoUrl: string | null } | null;
  quantiteAttendue: number;
  quantiteRecue: number;
  ecart: number;
  createdAt: string;
};

export default function ReceptionsPage() {
  const [receptions, setReceptions] = useState<Reception[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/receptions")
      .then((r) => r.json())
      .then((d) => { setReceptions(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const estConforme = (r: Reception) => r.ecart === 0;
  const conformes = receptions.filter(estConforme).length;
  const ecarts = receptions.length - conformes;

  return (
    <>
      <Header title="Réceptions" subtitle="Historique des comptages à l'entrée de stock" />
      <div className="flex-1 space-y-6 p-4 sm:p-6">

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <PackagePlus className="h-6 w-6 text-primary" />
              </div>
              <div><p className="text-2xl font-bold text-text-main">{receptions.length}</p><p className="text-sm text-text-muted">Total réceptions</p></div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <div><p className="text-2xl font-bold text-text-main">{conformes}</p><p className="text-sm text-text-muted">Conformes</p></div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div><p className="text-2xl font-bold text-text-main">{ecarts}</p><p className="text-sm text-text-muted">Avec écart</p></div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Link href="/receptions/nouvelle">
            <Button variant="accent" size="pill"><Plus className="h-4 w-4" />Nouvelle réception</Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-text-muted">Chargement…</div>
        ) : receptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-text-muted">
            <PackagePlus className="h-12 w-12 opacity-30" />
            <p className="text-sm">Aucune réception enregistrée</p>
            <Link href="/receptions/nouvelle">
              <Button variant="accent" size="sm"><Plus className="h-4 w-4" />Enregistrer une réception</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {receptions.map((r) => {
              const ok = estConforme(r);
              return (
                <Card key={r.id} className="card-hover overflow-hidden">
                  <CardContent className="p-0">
                    {/* Photos : carton + produit côte à côte */}
                    <div className="relative flex h-36 w-full">
                      {r.cartonChine && (
                        <div className="relative w-1/2 shrink-0 overflow-hidden bg-surface">
                          {r.cartonChine.photoUrl ? (
                            <img src={r.cartonChine.photoUrl} alt={r.cartonChine.identifiant} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-text-muted/30">
                              <Box className="h-8 w-8" />
                            </div>
                          )}
                          <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                            <Box className="h-2.5 w-2.5" />{r.cartonChine.identifiant}
                          </span>
                        </div>
                      )}
                      <div className={`relative shrink-0 overflow-hidden bg-surface ${r.cartonChine ? "w-1/2 border-l border-border" : "w-full"}`}>
                        {r.produit.imageUrl ? (
                          <img src={r.produit.imageUrl} alt={r.produit.nom} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-text-muted/30">
                            {r.cartonChine ? <Package className="h-8 w-8" /> : <ImageIcon className="h-8 w-8" />}
                          </div>
                        )}
                        <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                          <Package className="h-2.5 w-2.5" />Produit
                        </span>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge status={ok ? "VENDU" : "ECART"}>{ok ? "Conforme" : "Écart"}</Badge>
                      </div>
                    </div>

                    <div className="space-y-3 p-4">
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-semibold text-text-main">{r.produit.nom}</p>
                        <p className="mt-0.5 truncate text-xs text-text-muted">{r.gerant.prenom} {r.gerant.nom} · {formatDate(r.createdAt)}</p>
                      </div>

                      {(r.commandeChine || r.cartonChine) && (
                        <div className="flex flex-wrap gap-1.5">
                          {r.commandeChine && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-text-main">
                              <Ship className="h-3 w-3 text-text-muted" />{r.commandeChine.reference}
                            </span>
                          )}
                          {r.cartonChine && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-text-main">
                              <Box className="h-3 w-3 text-text-muted" />{r.cartonChine.identifiant}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2 rounded-xl bg-surface p-3 text-center">
                        <div>
                          <p className="text-[11px] text-text-muted">Attendu</p>
                          <p className="text-sm font-semibold text-text-main">{r.quantiteAttendue}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-text-muted">Reçu</p>
                          <p className="text-sm font-semibold text-text-main">{r.quantiteRecue}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-text-muted">Écart</p>
                          <p className={`flex items-center justify-center gap-0.5 text-sm font-semibold ${ok ? "text-emerald-600" : r.ecart < 0 ? "text-red-600" : "text-amber-600"}`}>
                            {r.ecart > 0 && <ArrowUpRight className="h-3.5 w-3.5" />}
                            {r.ecart < 0 && <ArrowDownRight className="h-3.5 w-3.5" />}
                            {r.ecart === 0 && <Check className="h-3.5 w-3.5" />}
                            {r.ecart > 0 ? `+${r.ecart}` : r.ecart}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-text-muted">{libelleEcart(r.ecart)}</p>
                    </div>
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
