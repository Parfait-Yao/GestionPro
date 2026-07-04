"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { TableauStock } from "@/components/stock/TableauStock";
import { GraphiqueEtat } from "@/components/stock/GraphiqueEtat";
import { Input } from "@/components/ui/Input";
import { useStock } from "@/hooks/useStock";
import { Boxes } from "lucide-react";

export default function StockPage() {
  const { data, isLoading } = useStock();
  const [search, setSearch] = useState("");

  const stock = (data?.stock ?? []).filter((s) =>
    s.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Header title="Stock en temps réel" subtitle="Vue consolidée par produit et par état" />
      <div className="flex-1 space-y-6 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-2 card-hover">
            <CardHeader className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Répartition du stock par produit</CardTitle>
              <div className="w-full sm:w-72">
                <Input
                  placeholder="Rechercher un produit..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-16 text-text-muted">Chargement…</div>
              ) : stock.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-text-muted">
                  <Boxes className="h-10 w-10 opacity-30" />
                  <p className="text-sm">Aucun produit en stock</p>
                </div>
              ) : (
                <TableauStock data={stock} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Répartition globale par état</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-16 text-text-muted">Chargement…</div>
              ) : (
                <GraphiqueEtat data={data?.repartition ?? []} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
