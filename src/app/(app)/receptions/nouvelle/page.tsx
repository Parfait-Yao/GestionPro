"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/Card";
import { FormulaireReception } from "@/components/reception/FormulaireReception";

export default function NouvelleReceptionPage() {
  const router = useRouter();

  return (
    <>
      <Header title="Nouvelle réception" subtitle="Associez le produit à sa commande et son carton, renseignez la quantité comptée" />
      <div className="flex-1 p-4 sm:p-6">
        <Card className="relative">
          <button
            onClick={() => router.push("/receptions")}
            aria-label="Fermer"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface hover:text-text-main"
          >
            <X className="h-4 w-4" />
          </button>
          <CardContent className="pt-12 sm:pt-14">
            <FormulaireReception />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
