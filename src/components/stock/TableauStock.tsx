import { Badge, statutLabels } from "@/components/ui/Badge";
import { formatQte } from "@/lib/utils";

export type LigneStock = {
  id: string;
  nom: string;
  categorie: string;
  RECU: number;
  EN_STOCK_BRUT: number;
  EN_TRANSFORMATION: number;
  EN_STOCK_TRANSFORME: number;
  VENDU: number;
  ECART_NON_EXPLIQUE: number;
};

const cols: Array<{ key: keyof LigneStock; status: string }> = [
  { key: "EN_STOCK_BRUT", status: "EN_STOCK_BRUT" },
  { key: "EN_TRANSFORMATION", status: "EN_TRANSFORMATION" },
  { key: "EN_STOCK_TRANSFORME", status: "EN_STOCK_TRANSFORME" },
  { key: "VENDU", status: "VENDU" },
  { key: "ECART_NON_EXPLIQUE", status: "ECART" },
];

export function TableauStock({ data }: { data: LigneStock[] }) {
  return (
    <>
      {/* Desktop / tablette */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs font-medium uppercase tracking-wide text-text-muted">
              <th className="py-3 pr-4">Produit</th>
              {cols.map((c) => (
                <th key={c.key} className="px-3 py-3">{statutLabels[c.status]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0 hover:bg-surface">
                <td className="py-3 pr-4">
                  <p className="font-semibold text-text-main">{row.nom}</p>
                  <p className="text-xs text-text-muted">{row.categorie}</p>
                </td>
                {cols.map((c) => (
                  <td key={c.key} className="px-3 py-3">
                    <Badge status={c.status}>{formatQte(row[c.key] as number, "")}</Badge>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="space-y-3 md:hidden">
        {data.map((row) => (
          <div key={row.id} className="rounded-md border border-border p-3">
            <p className="font-semibold text-text-main">{row.nom}</p>
            <p className="mb-2 text-xs text-text-muted">{row.categorie}</p>
            <div className="flex flex-wrap gap-2">
              {cols.map((c) => (
                <Badge key={c.key} status={c.status}>
                  {statutLabels[c.status]}: {row[c.key] as number}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
