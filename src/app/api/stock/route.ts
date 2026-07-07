import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function sumQuantite(rows: { type: string; _sum: { quantite: number | null } }[], type: string) {
  return rows.find((r) => r.type === type)?._sum.quantite ?? 0;
}

export async function GET() {
  try {
    const [produits, mouvements, receptions, mouvementsSortie] = await Promise.all([
      prisma.produit.findMany({ where: { actif: true }, orderBy: { nom: "asc" } }),
      prisma.mouvementStock.groupBy({ by: ["produitId", "type"], _sum: { quantite: true } }),
      prisma.reception.findMany({
        orderBy: { createdAt: "asc" },
        include: {
          produit: { select: { id: true, nom: true, imageUrl: true } },
          cartonChine: { select: { id: true, identifiant: true } },
        },
      }),
      prisma.mouvement.findMany({
        where: { type: "SORTIE", statut: { in: ["CONFIRMEE", "ESCALADE_PATRONNE"] } },
        orderBy: { createdAt: "asc" },
        select: { motif: true, lignes: { select: { produitId: true, quantite: true } } },
      }),
    ]);

    const sorties = mouvementsSortie.flatMap((m) =>
      m.lignes.map((l) => ({ produitId: l.produitId, motif: m.motif, quantiteConfirmee: l.quantite as number | null }))
    );

    const parProduit = new Map<string, { type: string; _sum: { quantite: number | null } }[]>();
    for (const m of mouvements) {
      const list = parProduit.get(m.produitId) ?? [];
      list.push({ type: m.type, _sum: m._sum });
      parProduit.set(m.produitId, list);
    }

    const totaux = { brut: 0, transformation: 0, transforme: 0, vendu: 0, usage: 0 };

    for (const p of produits) {
      const rows = parProduit.get(p.id) ?? [];
      const totalRecu = sumQuantite(rows, "RECEPTION");
      const totalVente = sumQuantite(rows, "VENTE");
      const totalTransfoDebut = sumQuantite(rows, "TRANSFORMATION_DEBUT");
      const totalTransfoFin = sumQuantite(rows, "TRANSFORMATION_FIN");
      const totalUsage = sumQuantite(rows, "USAGE_INTERNE");
      const totalRemplacement = sumQuantite(rows, "REMPLACEMENT_DEFECTUEUX");
      const totalCorrection = sumQuantite(rows, "CORRECTION_INVENTAIRE");

      const consomme = totalVente + totalTransfoDebut + totalUsage + totalRemplacement + totalCorrection;
      const brut = Math.max(0, totalRecu - consomme);
      const transformation = Math.max(0, totalTransfoDebut - totalTransfoFin);
      const transforme = totalTransfoFin;
      const vendu = totalVente + totalRemplacement + totalCorrection;

      totaux.brut += brut;
      totaux.transformation += transformation;
      totaux.transforme += transforme;
      totaux.vendu += vendu;
      totaux.usage += totalUsage;
    }

    // File de sorties confirmées par produit, dans l'ordre chronologique, pour imputation FIFO.
    const sortiesParProduit = new Map<string, { motif: string; remaining: number }[]>();
    for (const s of sorties) {
      if (s.quantiteConfirmee == null) continue;
      const list = sortiesParProduit.get(s.produitId) ?? [];
      list.push({ motif: s.motif, remaining: s.quantiteConfirmee });
      sortiesParProduit.set(s.produitId, list);
    }
    const curseurParProduit = new Map<string, number>();

    // Consommation répartie en FIFO : les cartons reçus en premier sont épuisés en premier,
    // par les sorties confirmées les plus anciennes en premier (aucun lien direct carton <-> sortie en base).
    const stock = receptions.map((r) => {
      let capacite = r.quantiteRecue;
      const motifsMap = new Map<string, number>();
      const file = sortiesParProduit.get(r.produitId) ?? [];
      let idx = curseurParProduit.get(r.produitId) ?? 0;

      while (capacite > 0 && idx < file.length) {
        const item = file[idx];
        if (item.remaining <= 0) {
          idx++;
          continue;
        }
        const pris = Math.min(capacite, item.remaining);
        motifsMap.set(item.motif, (motifsMap.get(item.motif) ?? 0) + pris);
        capacite -= pris;
        item.remaining -= pris;
        if (item.remaining === 0) idx++;
      }
      curseurParProduit.set(r.produitId, idx);

      return {
        id: r.id,
        cartonLabel: r.cartonChine?.identifiant ?? (r.cartonChine ? r.cartonChine.id : "Sans carton"),
        produitId: r.produit.id,
        produitNom: r.produit.nom,
        produitPhoto: r.produit.imageUrl,
        quantiteRecue: r.quantiteRecue,
        quantiteRestante: capacite,
        motifs: Array.from(motifsMap, ([motif, quantite]) => ({ motif, quantite })),
        createdAt: r.createdAt,
      };
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

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
