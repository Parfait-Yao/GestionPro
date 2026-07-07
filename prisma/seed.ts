import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const daysAgo = (n: number, h = 8, m = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(h, m, 0, 0);
  return d;
};

async function main() {
  const pin1234   = await bcrypt.hash("1234",   10);

  // ── Utilisateur ───────────────────────────────────────────────────────────
  const gerant = await prisma.utilisateur.upsert({
    where: { id: "seed-patronne-brou" },
    update: {},
    create: { id: "seed-patronne-brou", nom: "BROU", prenom: "Steven", role: "GERANT", pinHash: pin1234, actif: true },
  });
  console.log("✓ Brou Steven  (GERANT, PIN: 1234)");

  // ── Employés ──────────────────────────────────────────────────────────────
  const employes = [
    { id: "seed-emp-ibrahim",   nom: "KONÉ",      prenom: "Ibrahim",    role: "LIVREUR"   as const, telephone: "+225 07 11 22 33" },
    { id: "seed-emp-fatoumata", nom: "TRAORÉ",    prenom: "Fatoumata",  role: "COIFFEUSE" as const, telephone: "+225 07 44 55 66" },
    { id: "seed-emp-mamadou",   nom: "DIALLO",    prenom: "Mamadou",    role: "LIVREUR"   as const, telephone: "+225 05 77 88 99" },
    { id: "seed-emp-aicha",     nom: "COULIBALY", prenom: "Aïcha",      role: "CAISSIERE" as const, telephone: null               },
    { id: "seed-emp-aminata",   nom: "BAMBA",     prenom: "Aminata",    role: "COIFFEUSE" as const, telephone: "+225 01 23 45 67" },
    { id: "seed-emp-youssouf",  nom: "TOURÉ",     prenom: "Youssouf",   role: "VENDEUR"   as const, telephone: null               },
  ];
  for (const e of employes) {
    await prisma.employe.upsert({
      where: { id: e.id },
      update: { role: e.role, telephone: e.telephone },
      create: { id: e.id, nom: e.nom, prenom: e.prenom, role: e.role, telephone: e.telephone, actif: true },
    });
    console.log(`✓ ${e.prenom} ${e.nom} (${e.role})`);
  }

  // ── Produits ──────────────────────────────────────────────────────────────
  const produits = [
    {
      id: "seed-prod-cajou",       nom: "Noix de Cajou Brut",       categorie: "Matière Première",
      description: "Noix de cajou brutes non décortiquées", quantite: 487,
    },
    {
      id: "seed-prod-cajou-trans", nom: "Noix de Cajou Transformée", categorie: "Produit Transformé",
      description: "Noix de cajou décortiquées et séchées", quantite: 305,
    },
    {
      id: "seed-prod-mangue",      nom: "Mangue Séchée",             categorie: "Produit Transformé",
      description: "Tranches de mangue déshydratées", quantite: 198,
    },
    {
      id: "seed-prod-emballage",   nom: "Emballage Carton",          categorie: "Consommable",
      description: "Cartons d'emballage standard", quantite: 50,
    },
  ];
  for (const p of produits) {
    await prisma.produit.upsert({
      where: { id: p.id },
      update: {},
      create: { ...p, actif: true },
    });
    console.log(`✓ ${p.nom} (produit)`);
  }

  // ── Commandes Chine ───────────────────────────────────────────────────────
  const commandeChine1 = await prisma.commandeChine.upsert({
    where: { id: "seed-cmdchine-1" },
    update: {},
    create: { id: "seed-cmdchine-1", reference: "CHINE-2026-001", note: "Conteneur cajou + mangue" },
  });
  const cartonsChine = [
    { id: "seed-carton-1", commandeChineId: commandeChine1.id, identifiant: "CTN-A1" },
    { id: "seed-carton-2", commandeChineId: commandeChine1.id, identifiant: "CTN-A2" },
    { id: "seed-carton-3", commandeChineId: commandeChine1.id, identifiant: "CTN-B1" },
  ];
  for (const c of cartonsChine) {
    await prisma.cartonChine.upsert({ where: { id: c.id }, update: {}, create: c });
  }
  console.log("✓ 1 commande Chine + 3 cartons");

  // ── Réceptions ────────────────────────────────────────────────────────────
  const receptions = [
    {
      id: "seed-rec-1",
      produitId: "seed-prod-cajou", gerantId: gerant.id,
      commandeChineId: commandeChine1.id, cartonChineId: "seed-carton-1",
      quantiteAttendue: 500, quantiteRecue: 487, ecart: -13,
      valide: true, createdAt: daysAgo(15),
    },
    {
      id: "seed-rec-2",
      produitId: "seed-prod-cajou", gerantId: gerant.id,
      commandeChineId: commandeChine1.id, cartonChineId: "seed-carton-2",
      quantiteAttendue: 300, quantiteRecue: 305, ecart: 5,
      valide: true, createdAt: daysAgo(7),
    },
    {
      id: "seed-rec-3",
      produitId: "seed-prod-mangue", gerantId: gerant.id,
      commandeChineId: commandeChine1.id, cartonChineId: "seed-carton-3",
      quantiteAttendue: 200, quantiteRecue: 198, ecart: -2,
      valide: true, createdAt: daysAgo(10),
    },
    {
      id: "seed-rec-4",
      produitId: "seed-prod-emballage", gerantId: gerant.id,
      quantiteAttendue: 50, quantiteRecue: 50, ecart: 0,
      valide: true, createdAt: daysAgo(5),
    },
  ];
  for (const r of receptions) {
    await prisma.reception.upsert({ where: { id: r.id }, update: {}, create: r });
  }
  console.log(`✓ ${receptions.length} réceptions`);

  // ── Mouvements Stock ──────────────────────────────────────────────────────
  const mouvements = [
    { id: "seed-mouv-1",  produitId: "seed-prod-cajou",       gerantId: gerant.id, type: "RECEPTION" as const,             etatDepart: null,                          etatArrivee: "EN_STOCK_BRUT" as const,       quantite: 487, createdAt: daysAgo(15) },
    { id: "seed-mouv-2",  produitId: "seed-prod-cajou",       gerantId: gerant.id, type: "RECEPTION" as const,             etatDepart: null,                          etatArrivee: "EN_STOCK_BRUT" as const,       quantite: 305, createdAt: daysAgo(7)  },
    { id: "seed-mouv-3",  produitId: "seed-prod-cajou",       gerantId: gerant.id, type: "TRANSFORMATION_DEBUT" as const,  etatDepart: "EN_STOCK_BRUT" as const,     etatArrivee: "EN_TRANSFORMATION" as const,   quantite: 200, createdAt: daysAgo(12) },
    { id: "seed-mouv-4",  produitId: "seed-prod-cajou-trans", gerantId: gerant.id, type: "TRANSFORMATION_FIN" as const,    etatDepart: "EN_TRANSFORMATION" as const, etatArrivee: "EN_STOCK_TRANSFORME" as const, quantite: 160, createdAt: daysAgo(9)  },
    { id: "seed-mouv-5",  produitId: "seed-prod-cajou-trans", gerantId: gerant.id, type: "VENTE" as const,                 etatDepart: "EN_STOCK_TRANSFORME" as const, etatArrivee: "VENDU" as const,              quantite: 40,  createdAt: daysAgo(6)  },
    { id: "seed-mouv-6",  produitId: "seed-prod-mangue",      gerantId: gerant.id, type: "RECEPTION" as const,             etatDepart: null,                          etatArrivee: "EN_STOCK_BRUT" as const,       quantite: 198, createdAt: daysAgo(10) },
    { id: "seed-mouv-7",  produitId: "seed-prod-mangue",      gerantId: gerant.id, type: "TRANSFORMATION_DEBUT" as const,  etatDepart: "EN_STOCK_BRUT" as const,     etatArrivee: "EN_TRANSFORMATION" as const,   quantite: 100, createdAt: daysAgo(8)  },
    { id: "seed-mouv-8",  produitId: "seed-prod-mangue",      gerantId: gerant.id, type: "TRANSFORMATION_FIN" as const,    etatDepart: "EN_TRANSFORMATION" as const, etatArrivee: "EN_STOCK_TRANSFORME" as const, quantite: 85,  createdAt: daysAgo(5)  },
    { id: "seed-mouv-9",  produitId: "seed-prod-cajou",       gerantId: gerant.id, type: "CORRECTION_INVENTAIRE" as const, etatDepart: "EN_STOCK_BRUT" as const,    etatArrivee: "EN_STOCK_BRUT" as const,       quantite: -8,  createdAt: daysAgo(3)  },
    { id: "seed-mouv-10", produitId: "seed-prod-emballage",   gerantId: gerant.id, type: "RECEPTION" as const,             etatDepart: null,                          etatArrivee: "EN_STOCK_BRUT" as const,       quantite: 50,  createdAt: daysAgo(5)  },
  ];
  for (const m of mouvements) {
    await prisma.mouvementStock.upsert({ where: { id: m.id }, update: {}, create: m });
  }
  console.log(`✓ ${mouvements.length} mouvements stock`);

  // ── Mouvements de stock (entrée/sortie) ──────────────────────────────────
  const mouvementsEntreeSortie = [
    {
      id: "seed-mouvement-1", type: "SORTIE" as const,
      employeId: "seed-emp-ibrahim", gerantId: gerant.id,
      motif: "VENTE" as const, statut: "CONFIRMEE" as const, createdAt: daysAgo(6, 9),
      lignes: [{ id: "seed-mouvement-1-l1", produitId: "seed-prod-cajou-trans", quantite: 30 }],
    },
    {
      id: "seed-mouvement-2", type: "SORTIE" as const,
      employeId: "seed-emp-fatoumata", gerantId: gerant.id,
      motif: "VENTE" as const, statut: "CONFIRMEE" as const, createdAt: daysAgo(4, 10),
      lignes: [{ id: "seed-mouvement-2-l1", produitId: "seed-prod-mangue", quantite: 48 }],
    },
    {
      id: "seed-mouvement-3", type: "SORTIE" as const,
      employeId: "seed-emp-aicha", gerantId: gerant.id,
      motif: "VENTE" as const, statut: "CONFIRMEE" as const, createdAt: daysAgo(1),
      lignes: [{ id: "seed-mouvement-3-l1", produitId: "seed-prod-cajou-trans", quantite: 20 }],
    },
  ];
  for (const m of mouvementsEntreeSortie) {
    const { lignes, ...data } = m;
    await prisma.mouvement.upsert({ where: { id: m.id }, update: {}, create: data });
    for (const l of lignes) {
      await prisma.mouvementLigne.upsert({ where: { id: l.id }, update: {}, create: { ...l, mouvementId: m.id } });
    }
  }
  console.log(`✓ ${mouvementsEntreeSortie.length} mouvements entrée/sortie`);

  // ── Pointages ─────────────────────────────────────────────────────────────
  const today = new Date();
  const pointages = [
    { id: "seed-pt-1", employeId: "seed-emp-ibrahim",   gerantId: gerant.id, entreeAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7, 30), sortieAt: null },
    { id: "seed-pt-2", employeId: "seed-emp-fatoumata", gerantId: gerant.id, entreeAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7, 45), sortieAt: null },
    { id: "seed-pt-3", employeId: "seed-emp-mamadou",   gerantId: gerant.id, entreeAt: daysAgo(1, 7, 30), sortieAt: daysAgo(1, 17,  0) },
    { id: "seed-pt-4", employeId: "seed-emp-aicha",     gerantId: gerant.id, entreeAt: daysAgo(1, 7, 50), sortieAt: daysAgo(1, 17, 15) },
  ];
  for (const p of pointages) {
    await prisma.pointage.upsert({ where: { id: p.id }, update: {}, create: p });
  }
  console.log(`✓ ${pointages.length} pointages`);

  // ── Comptages ─────────────────────────────────────────────────────────────
  const comptage1 = await prisma.comptage.upsert({
    where: { id: "seed-compt-1" },
    update: {},
    create: { id: "seed-compt-1", produitId: "seed-prod-cajou", gerantId: gerant.id, stockTheorique: 584, stockReel: 572, ecart: -12, note: "Comptage mensuel", createdAt: daysAgo(3) },
  });
  await prisma.comptage.upsert({
    where: { id: "seed-compt-2" },
    update: {},
    create: { id: "seed-compt-2", produitId: "seed-prod-mangue", gerantId: gerant.id, stockTheorique: 148, stockReel: 145, ecart: -3, note: "Légère perte", createdAt: daysAgo(1) },
  });
  console.log("✓ 2 comptages");

  // ── Alertes ───────────────────────────────────────────────────────────────
  await prisma.alerte.upsert({
    where: { id: "seed-alerte-1" },
    update: {},
    create: {
      id: "seed-alerte-1", produitId: "seed-prod-cajou", comptageId: comptage1.id,
      ecartQuantite: -12, periodeDebut: daysAgo(15), periodeFin: daysAgo(3),
      gerantEnPoste: "Brou Steven", employesConcernes: ["Ibrahim Koné", "Mamadou Diallo"],
      statut: "OUVERTE", createdAt: daysAgo(3),
    },
  });
  console.log("✓ 1 alerte");

  // ── Commandes ─────────────────────────────────────────────────────────────
  const commandes = [
    {
      id: "seed-cmd-1", reference: "CMD-20260701-1001",
      client: "Kouassi Amos", telephoneClient: "+225 07 55 66 77",
      adresseLivraison: "Cocody, Angré 8ème tranche",
      produitId: "seed-prod-cajou-trans", quantite: 25, prixUnitaire: 3500,
      statut: "LIVREE" as const, livreurId: "seed-emp-ibrahim",
      gerantId: gerant.id, commandeAt: daysAgo(5), livraisonAt: daysAgo(4),
    },
    {
      id: "seed-cmd-2", reference: "CMD-20260701-1002",
      client: "Adjoua Marie", telephoneClient: "+225 05 22 33 44",
      adresseLivraison: "Yopougon, Marché Gouro",
      produitId: "seed-prod-mangue", quantite: 30, prixUnitaire: 2000,
      statut: "EN_LIVRAISON" as const, livreurId: "seed-emp-mamadou",
      gerantId: gerant.id, commandeAt: daysAgo(1), livraisonAt: null,
    },
    {
      id: "seed-cmd-3", reference: "CMD-20260701-1003",
      client: "Bah Ibrahim", telephoneClient: "+225 01 88 99 00",
      adresseLivraison: "Abobo, terminus",
      produitId: "seed-prod-cajou", quantite: 100, prixUnitaire: 1200,
      statut: "EN_ATTENTE" as const, livreurId: null,
      gerantId: gerant.id, commandeAt: daysAgo(0), livraisonAt: null,
    },
  ];
  for (const c of commandes) {
    await prisma.commande.upsert({ where: { id: c.id }, update: {}, create: c });
    console.log(`✓ Commande ${c.reference} (${c.statut})`);
  }

  // ── Configurations ────────────────────────────────────────────────────────
  const configs = [
    { cle: "whatsapp_numero_patronne", valeur: "+2250172703242" },
    { cle: "rapport_auto_actif",       valeur: "false"           },
    { cle: "rapport_heure_auto",       valeur: "18:00"           },
    { cle: "seuil_escalade_sortie",    valeur: "50"              },
  ];
  for (const c of configs) {
    await prisma.configuration.upsert({ where: { cle: c.cle }, update: { valeur: c.valeur }, create: c });
  }
  console.log("✓ Configurations");

  console.log("\n✅ Seed terminé !");
  console.log("─────────────────────────────────────────────────");
  console.log("  Brou Steven    (GERANT)  →  PIN : 1234");
  console.log("─────────────────────────────────────────────────");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
