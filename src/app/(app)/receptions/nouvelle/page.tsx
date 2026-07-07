import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/Card";
import { FormulaireReception } from "@/components/reception/FormulaireReception";

export default function NouvelleReceptionPage() {
  return (
    <>
      <Header title="Nouvelle réception" subtitle="Associez le produit à sa commande et son carton, renseignez la quantité comptée" />
      <div className="flex-1 p-4 sm:p-6">
        <Card>
          <CardContent>
            <FormulaireReception />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
