"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Plus, PackagePlus, CheckCircle2, AlertTriangle, Boxes } from "lucide-react";
import { formatDate, libelleEcart } from "@/lib/utils";

type Reception = {
  id: string;
  produit: { nom: string };
  gerant: { nom: string; prenom: string };
  commandeChine: { id: string; reference: string } | null;
  cartonChine: { id: string; identifiant: string } | null;
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
                    <div className="flex items-start gap-4 p-5">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${ok ? "from-emerald-500 to-emerald-400" : "from-red-500 to-red-400"} text-white shadow-md`}>
                        <Boxes className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-text-main truncate">{r.produit.nom}</p>
                        <p className="text-xs text-text-muted mt-0.5">{r.gerant.prenom} {r.gerant.nom} · {formatDate(r.createdAt)}</p>
                        <div className="mt-2">
                          <Badge status={ok ? "VENDU" : "ECART"}>{ok ? "Conforme" : "Écart"}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border px-5 py-3 grid grid-cols-3 gap-2 text-center">
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
                        <p className={`text-sm font-semibold ${ok ? "text-emerald-600" : "text-red-600"}`}>
                          {r.ecart > 0 ? `+${r.ecart}` : r.ecart}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-border px-5 py-2.5 text-xs text-text-muted">
                      {r.commandeChine ? `${r.commandeChine.reference}` : "Sans commande"}
                      {r.cartonChine ? ` · Carton ${r.cartonChine.identifiant}` : ""}
                      {" · "}
                      {libelleEcart(r.ecart)}
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
