import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { TableauStock, type LigneStock } from "@/components/stock/TableauStock";
import { GraphiqueEtat } from "@/components/stock/GraphiqueEtat";
import { Input } from "@/components/ui/Input";

const stock: LigneStock[] = [
  { id: "1", nom: "Coques iPhone 14", categorie: "Accessoires téléphonie", RECU: 500, EN_STOCK_BRUT: 320, EN_TRANSFORMATION: 0, EN_STOCK_TRANSFORME: 0, VENDU: 180, ECART_NON_EXPLIQUE: 0 },
  { id: "2", nom: "Câble USB-C 1m", categorie: "Accessoires téléphonie", RECU: 1200, EN_STOCK_BRUT: 640, EN_TRANSFORMATION: 0, EN_STOCK_TRANSFORME: 0, VENDU: 545, ECART_NON_EXPLIQUE: 15 },
  { id: "3", nom: "Housse Samsung A54", categorie: "Accessoires téléphonie", RECU: 400, EN_STOCK_BRUT: 210, EN_TRANSFORMATION: 40, EN_STOCK_TRANSFORME: 60, VENDU: 90, ECART_NON_EXPLIQUE: 0 },
];

export default function StockPage() {
  return (
    <>
      <Header title="Stock en temps réel" subtitle="Vue consolidée par produit et par état" />
      <div className="flex-1 space-y-6 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-2 card-hover">
            <CardHeader className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Répartition du stock par produit</CardTitle>
              <div className="w-full sm:w-72">
                <Input placeholder="Rechercher un produit..." />
              </div>
            </CardHeader>
            <CardContent>
              <TableauStock data={stock} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Répartition globale par état</CardTitle>
            </CardHeader>
            <CardContent>
              <GraphiqueEtat />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
