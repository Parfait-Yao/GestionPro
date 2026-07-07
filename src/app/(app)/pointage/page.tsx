"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { SaisieMouvementsTable } from "@/components/mouvements/SaisieMouvementsTable";
import { HistoriqueMouvementsTable } from "@/components/mouvements/HistoriqueMouvementsTable";
import { PackageMinus, ArrowDownCircle, ArrowUpCircle, ListPlus, History } from "lucide-react";
import { useMouvements } from "@/hooks/useMouvements";

export default function PointagePage() {
  const [sousTab, setSousTab] = useState<"saisie" | "historique">("saisie");

  const { data: mouvements = [] } = useMouvements();

  const entrees = mouvements.filter((m) => m.type === "ENTREE").length;
  const sorties = mouvements.filter((m) => m.type === "SORTIE").length;

  return (
    <>
      <Header title="Mouvements de stock" subtitle="Entrées et sorties de stock, en un seul endroit" />
      <div className="flex-1 space-y-6 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <PackageMinus className="h-6 w-6 text-primary" />
              </div>
              <div><p className="text-2xl font-bold text-text-main">{mouvements.length}</p><p className="text-sm text-text-muted">Total mouvements</p></div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                <ArrowDownCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div><p className="text-2xl font-bold text-text-main">{entrees}</p><p className="text-sm text-text-muted">Entrées</p></div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
                <ArrowUpCircle className="h-6 w-6 text-danger" />
              </div>
              <div><p className="text-2xl font-bold text-text-main">{sorties}</p><p className="text-sm text-text-muted">Sorties</p></div>
            </CardContent>
          </Card>
        </div>

        <Tabs
          active={sousTab}
          onChange={(v) => setSousTab(v as "saisie" | "historique")}
          tabs={[
            { value: "saisie", label: "Saisie", icon: ListPlus },
            { value: "historique", label: "Historique", icon: History },
          ]}
        />

        {sousTab === "saisie" ? <SaisieMouvementsTable /> : <HistoriqueMouvementsTable />}
      </div>
    </>
  );
}
