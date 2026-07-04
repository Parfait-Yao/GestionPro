import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function sumQuantite(rows: { type: string; _sum: { quantite: number | null } }[], type: string) {
  return rows.find((r) => r.type === type)?._sum.quantite ?? 0;
}

export async function GET() {
  try {
    const [produits, mouvements] = await Promise.all([
      prisma.produit.findMany({ where: { actif: true }, orderBy: { nom: "asc" } }),
      prisma.mouvementStock.groupBy({ by: ["produitId", "type"], _sum: { quantite: true } }),
    ]);

    const parProduit = new Map<string, { type: string; _sum: { quantite: number | null } }[]>();
    for (const m of mouvements) {
      const list = parProduit.get(m.produitId) ?? [];
      list.push({ type: m.type, _sum: m._sum });
      parProduit.set(m.produitId, list);
    }

    const totaux = { brut: 0, transformation: 0, transforme: 0, vendu: 0, usage: 0 };

    const stock = produits.map((p) => {
      const rows = parProduit.get(p.id) ?? [];
      const totalRecu = sumQuantite(rows, "RECEPTION");
      const totalVente = sumQuantite(rows, "VENTE");
      const totalTransfoDebut = sumQuantite(rows, "TRANSFORMATION_DEBUT");
      const totalTransfoFin = sumQuantite(rows, "TRANSFORMATION_FIN");
      const totalUsage = sumQuantite(rows, "USAGE_INTERNE");
      const totalRemplacement = sumQuantite(rows, "REMPLACEMENT_DEFECTUEUX");
      const totalCorrection = sumQuantite(rows, "CORRECTION_INVENTAIRE");

      const brut = Math.max(0, totalRecu - totalVente - totalTransfoDebut - totalUsage - totalRemplacement - totalCorrection);
      const transformation = Math.max(0, totalTransfoDebut - totalTransfoFin);
      const transforme = totalTransfoFin;
      const vendu = totalVente + totalRemplacement + totalCorrection;

      totaux.brut += brut;
      totaux.transformation += transformation;
      totaux.transforme += transforme;
      totaux.vendu += vendu;
      totaux.usage += totalUsage;

      return {
        id: p.id,
        nom: p.nom,
        categorie: p.categorie ?? "Non classé",
        RECU: totalRecu,
        EN_STOCK_BRUT: brut,
        EN_TRANSFORMATION: transformation,
        EN_STOCK_TRANSFORME: transforme,
        VENDU: vendu,
        ECART_NON_EXPLIQUE: 0,
      };
    });

    const totalGlobal = totaux.brut + totaux.transformation + totaux.transforme + totaux.vendu + totaux.usage;
    const repartition = totalGlobal === 0 ? [] : [
      { name: "En stock brut", value: Math.round((totaux.brut / totalGlobal) * 1000) / 10, color: "#2E6DA4" },
      { name: "En transformation", value: Math.round((totaux.transformation / totalGlobal) * 1000) / 10, color: "#F9772F" },
      { name: "Transformé", value: Math.round((totaux.transforme / totalGlobal) * 1000) / 10, color: "#E67E22" },
      { name: "Vendu", value: Math.round((totaux.vendu / totalGlobal) * 1000) / 10, color: "#27AE60" },
      { name: "Usage interne", value: Math.round((totaux.usage / totalGlobal) * 1000) / 10, color: "#8B5CF6" },
    ].filter((d) => d.value > 0);

    return NextResponse.json({ stock, repartition });
  } catch (err) {
    console.error("Erreur stock:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
