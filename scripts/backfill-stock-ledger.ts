import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient, type Prisma } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { allouerFifo, recalculerQuantiteProduit } from "../src/lib/stock";
import { ETAT_PAR_MOTIF_SORTIE, ETAT_ENTREE, type MotifValue } from "../src/lib/motifs";

async function getGerantId(tx: Tx): Promise<string | null> {
  const gerant = await tx.utilisateur.findFirst({ where: { role: "GERANT", actif: true }, select: { id: true } });
  return gerant?.id ?? null;
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const DRY_RUN = process.argv.includes("--dry-run");

class DryRunRollback extends Error {}

type Tx = Prisma.TransactionClient;

async function migrer(tx: Tx) {
  // Compensation rétroactive : avant la correction de la route carton→produit,
  // enregistrer un produit sur un carton fixait Produit.quantite directement sans
  // jamais créer de Reception. Ces produits n'ont donc aucune source dans le nouveau
  // ledger dérivé — on crée la Reception manquante pour qu'ils gardent leur stock réel
  // au lieu de retomber à 0.
  const gerantId = await getGerantId();
  const cartonsSansReception = await tx.cartonChine.findMany({
    where: { produitId: { not: null } },
    include: { produit: true },
  });
  for (const c of cartonsSansReception) {
    if (!c.produit || c.produit.quantite <= 0) continue;
    const dejaRecu = await tx.reception.findFirst({ where: { produitId: c.produit.id } });
    if (dejaRecu) continue;
    if (!gerantId) throw new Error("Aucun gérant configuré — impossible de créer la réception de compensation.");
    console.log(`Compensation : ${c.produit.nom} (carton ${c.identifiant}) n'avait aucune réception — création d'une réception rétroactive de ${c.produit.quantite} unité(s).`);
    await tx.reception.create({
      data: {
        produitId: c.produit.id,
        gerantId,
        commandeChineId: c.commandeChineId,
        cartonChineId: c.id,
        quantiteAttendue: c.produit.quantite,
        quantiteRecue: c.produit.quantite,
        ecart: 0,
        valide: true,
      },
    });
  }

  const anciens = await tx.mouvement.findMany({
    include: { lignes: true },
    orderBy: { createdAt: "asc" },
  });

  console.log(`${anciens.length} ancien(s) mouvement(s) à migrer.`);

  let enAttenteRestants = 0;

  for (const m of anciens) {
    const sens = m.type;
    let motif: MotifValue = m.motif;
    let noteMotif = m.noteMotif ?? "";

    // Ancien système : une ENTREE pouvait porter n'importe quel motif de sortie
    // (bug corrigé). On préserve le motif d'origine dans la note et on normalise
    // toute ENTREE vers CORRECTION_INVENTAIRE, seul motif d'entrée valide désormais.
    if (sens === "ENTREE" && motif !== "CORRECTION_INVENTAIRE") {
      noteMotif = `${noteMotif ? noteMotif + " — " : ""}motif d'origine : ${motif}`;
      motif = "CORRECTION_INVENTAIRE";
    }

    const lignesData: Prisma.StockMouvementLigneUncheckedCreateWithoutMouvementInput[] = [];

    if (sens === "SORTIE") {
      const etatArrivee = ETAT_PAR_MOTIF_SORTIE[motif as Exclude<MotifValue, "CORRECTION_INVENTAIRE">] ?? "SORTIE_AUTRE";
      if (m.statut === "CONFIRMEE") {
        for (const l of m.lignes) {
          const allocations = await allouerFifo(tx, l.produitId, l.quantite);
          for (const a of allocations) {
            lignesData.push({ produitId: l.produitId, cartonChineId: a.cartonChineId, quantite: a.quantite, etatDepart: null, etatArrivee });
          }
        }
      } else {
        // EN_ATTENTE / ESCALADE_PATRONNE / REFUSEE : pas de FIFO, jamais eu d'impact stock.
        for (const l of m.lignes) {
          lignesData.push({ produitId: l.produitId, cartonChineId: null, quantite: l.quantite, etatDepart: null, etatArrivee });
        }
        if (m.statut !== "REFUSEE") enAttenteRestants++;
      }
    } else {
      // ENTREE : toujours confirmée directement dans l'ancien système.
      for (const l of m.lignes) {
        lignesData.push({ produitId: l.produitId, cartonChineId: null, quantite: l.quantite, etatDepart: null, etatArrivee: ETAT_ENTREE });
      }
    }

    await tx.stockMouvement.create({
      data: {
        sens,
        motif,
        noteMotif: noteMotif || null,
        employeId: m.employeId,
        gerantId: m.gerantId,
        statut: m.statut,
        createdAt: m.createdAt,
        lignes: { create: lignesData },
      },
    });
  }

  console.log("\n--- Recalcul Produit.quantite (source unique = réceptions + mouvements confirmés) ---");
  // Recalcule pour TOUS les produits (pas seulement ceux touchés par un mouvement) :
  // un produit avec des réceptions mais aucun mouvement confirmé doit quand même
  // refléter sa quantité reçue, au lieu de rester figé à son ancienne valeur morte.
  const tousProduits = await tx.produit.findMany({ select: { id: true, nom: true, quantite: true } });
  for (const p of tousProduits) {
    const after = await recalculerQuantiteProduit(tx, p.id);
    const diff = after - p.quantite;
    if (diff !== 0) {
      console.log(`${p.nom} : ${p.quantite} -> ${after} (${diff >= 0 ? "+" : ""}${diff})`);
    }
  }

  if (enAttenteRestants > 0) {
    console.log(`\n⚠ ${enAttenteRestants} sortie(s) EN_ATTENTE/ESCALADE_PATRONNE migrée(s) telle(s) quelle(s) — à confirmer ou refuser manuellement depuis l'historique après bascule.`);
  }
}

async function main() {
  try {
    await prisma.$transaction(
      async (tx) => {
        await migrer(tx);
        if (DRY_RUN) throw new DryRunRollback();
      },
      { timeout: 60000, maxWait: 30000 }
    );
    console.log(DRY_RUN ? "\nDry run terminé — rollback, aucune écriture persistée." : "\nBackfill terminé et validé.");
  } catch (e) {
    if (e instanceof DryRunRollback) {
      console.log("\nDry run terminé — rollback, aucune écriture persistée.");
    } else {
      throw e;
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
