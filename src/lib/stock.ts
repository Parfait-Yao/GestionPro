import type { Prisma } from "@/generated/prisma";

type Tx = Prisma.TransactionClient;

export class StockInsuffisantError extends Error {
  constructor(public produitId: string, public produitNom: string, public demande: number, public disponible: number) {
    super(`Stock insuffisant pour ${produitNom} : demandé ${demande}, disponible ${disponible}`);
    this.name = "StockInsuffisantError";
  }
}

/** Stock confirmé = reçu (réceptions) - sorties confirmées + entrées confirmées. */
export async function getStockConfirme(tx: Tx, produitId: string): Promise<number> {
  const [recu, sorties, entrees] = await Promise.all([
    tx.reception.aggregate({ where: { produitId }, _sum: { quantiteRecue: true } }),
    tx.stockMouvementLigne.aggregate({
      where: { produitId, mouvement: { sens: "SORTIE", statut: "CONFIRMEE" } },
      _sum: { quantite: true },
    }),
    tx.stockMouvementLigne.aggregate({
      where: { produitId, mouvement: { sens: "ENTREE", statut: "CONFIRMEE" } },
      _sum: { quantite: true },
    }),
  ]);
  return (recu._sum.quantiteRecue ?? 0) - (sorties._sum.quantite ?? 0) + (entrees._sum.quantite ?? 0);
}

/** Quantité réservée par des sorties en attente/escaladées (pas encore imputées à un carton). */
export async function getStockReserve(tx: Tx, produitId: string, excludeMouvementId?: string): Promise<number> {
  const res = await tx.stockMouvementLigne.aggregate({
    where: {
      produitId,
      mouvement: {
        sens: "SORTIE",
        statut: { in: ["EN_ATTENTE", "ESCALADE_PATRONNE"] },
        ...(excludeMouvementId ? { id: { not: excludeMouvementId } } : {}),
      },
    },
    _sum: { quantite: true },
  });
  return res._sum.quantite ?? 0;
}

/** Ce qui peut réellement être sorti maintenant : confirmé moins les réservations en cours. */
export async function getStockDisponible(tx: Tx, produitId: string, excludeMouvementId?: string): Promise<number> {
  const [confirme, reserve] = await Promise.all([
    getStockConfirme(tx, produitId),
    getStockReserve(tx, produitId, excludeMouvementId),
  ]);
  return confirme - reserve;
}

/** Source unique de vérité pour Produit.quantite — recalcul complet, jamais d'incrément/décrément manuel. */
export async function recalculerQuantiteProduit(tx: Tx, produitId: string): Promise<number> {
  const quantite = await getStockConfirme(tx, produitId);
  await tx.produit.update({ where: { id: produitId }, data: { quantite } });
  return quantite;
}

/**
 * Alloue une quantité SORTIE en FIFO sur les cartons du produit (réceptions les plus
 * anciennes en premier), en ne prenant en compte que les lignes déjà CONFIRMEE. Lève
 * une erreur si le stock est insuffisant — l'appelant doit avoir déjà vérifié
 * getStockDisponible avant d'appeler cette fonction.
 */
export async function allouerFifo(
  tx: Tx,
  produitId: string,
  quantiteNecessaire: number
): Promise<{ cartonChineId: string | null; quantite: number }[]> {
  const receptions = await tx.reception.findMany({
    where: { produitId },
    orderBy: { createdAt: "asc" },
    select: { cartonChineId: true, quantiteRecue: true },
  });

  const consomme = await tx.stockMouvementLigne.groupBy({
    by: ["cartonChineId"],
    where: { produitId, mouvement: { sens: "SORTIE", statut: "CONFIRMEE" } },
    _sum: { quantite: true },
  });
  const consommeParCarton = new Map(consomme.map((c) => [c.cartonChineId, c._sum.quantite ?? 0]));

  const allocations: { cartonChineId: string | null; quantite: number }[] = [];
  let restant = quantiteNecessaire;

  for (const r of receptions) {
    if (restant <= 0) break;
    const dejaConsomme = consommeParCarton.get(r.cartonChineId) ?? 0;
    const disponibleCarton = r.quantiteRecue - dejaConsomme;
    if (disponibleCarton <= 0) continue;
    const pris = Math.min(disponibleCarton, restant);
    allocations.push({ cartonChineId: r.cartonChineId, quantite: pris });
    restant -= pris;
  }

  if (restant > 0) {
    throw new Error(`Allocation FIFO impossible : ${restant} unité(s) non allouable(s) pour le produit ${produitId}`);
  }
  return allocations;
}

const SEUIL_ESCALADE_DEFAUT = 50;

export async function getSeuilEscalade(tx: Tx): Promise<number> {
  const config = await tx.configuration.findUnique({ where: { cle: "seuil_escalade_sortie" } });
  return Number(config?.valeur) || SEUIL_ESCALADE_DEFAUT;
}
