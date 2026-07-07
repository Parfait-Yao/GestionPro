import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { libelleEcart, formatRelative } from "@/lib/utils";
import { MOTIF_LABELS } from "@/lib/motifs";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function variationPct(actuel: number, precedent: number): number {
  if (precedent === 0) return actuel > 0 ? 100 : 0;
  return Math.round(((actuel - precedent) / precedent) * 1000) / 10;
}

function sumQuantite(rows: { type: string; _sum: { quantite: number | null } }[], type: string) {
  return rows.find((r) => r.type === type)?._sum.quantite ?? 0;
}

export async function GET() {
  try {
    const maintenant = new Date();
    const debutJour = startOfDay(maintenant);
    const debutHier = addDays(debutJour, -1);
    const debutMois = startOfMonth(maintenant);
    const debutMoisDernier = startOfMonth(addDays(debutMois, -1));
    const debut30j = addDays(debutJour, -29);

    const [
      mouvementsParType,
      commandesCeMois,
      commandesMoisDernier,
      commandesEnAttente,
      sortiesDuJour,
      sortiesHier,
      mouvementsEscalade,
      alertesOuvertes,
      receptionsCeMois,
      employesActifs,
      produitsCatalogue,
      mouvements30j,
      receptionsRecentes,
      mouvementsRecents,
      pointagesRecents,
      alertesRecentes,
    ] = await Promise.all([
      prisma.mouvementStock.groupBy({ by: ["type"], _sum: { quantite: true } }),
      prisma.commande.count({ where: { commandeAt: { gte: debutMois } } }),
      prisma.commande.count({ where: { commandeAt: { gte: debutMoisDernier, lt: debutMois } } }),
      prisma.commande.count({ where: { statut: "EN_ATTENTE" } }),
      prisma.mouvement.count({ where: { type: "SORTIE", createdAt: { gte: debutJour } } }),
      prisma.mouvement.count({ where: { type: "SORTIE", createdAt: { gte: debutHier, lt: debutJour } } }),
      prisma.mouvement.findMany({
        where: { statut: "ESCALADE_PATRONNE" },
        include: { lignes: { include: { produit: { select: { nom: true } } } }, employe: { select: { nom: true, prenom: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.alerte.count({ where: { statut: "OUVERTE" } }),
      prisma.reception.count({ where: { createdAt: { gte: debutMois } } }),
      prisma.employe.count({ where: { actif: true } }),
      prisma.produit.count({ where: { actif: true } }),
      prisma.mouvementStock.findMany({
        where: { createdAt: { gte: debut30j } },
        select: { createdAt: true, quantite: true },
      }),
      prisma.reception.findMany({
        include: { produit: { select: { nom: true } }, gerant: { select: { nom: true, prenom: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.mouvement.findMany({
        include: { lignes: { include: { produit: { select: { nom: true } } } }, employe: { select: { nom: true, prenom: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.pointage.findMany({
        include: { employe: { select: { nom: true, prenom: true } } },
        orderBy: { entreeAt: "desc" },
        take: 5,
      }),
      prisma.alerte.findMany({
        include: { produit: { select: { nom: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const totalRecu = sumQuantite(mouvementsParType, "RECEPTION");
    const totalVente = sumQuantite(mouvementsParType, "VENTE");
    const totalTransfoDebut = sumQuantite(mouvementsParType, "TRANSFORMATION_DEBUT");
    const totalTransfoFin = sumQuantite(mouvementsParType, "TRANSFORMATION_FIN");
    const totalUsage = sumQuantite(mouvementsParType, "USAGE_INTERNE");
    const totalRemplacement = sumQuantite(mouvementsParType, "REMPLACEMENT_DEFECTUEUX");
    const totalCorrection = sumQuantite(mouvementsParType, "CORRECTION_INVENTAIRE");

    const brut = Math.max(0, totalRecu - totalVente - totalTransfoDebut - totalUsage - totalRemplacement - totalCorrection);
    const transformation = Math.max(0, totalTransfoDebut - totalTransfoFin);
    const transforme = totalTransfoFin;
    const stockTotal = brut + transformation + transforme;

    // Courbe des mouvements — 30 derniers jours, un point par jour.
    const parJour = new Map<string, number>();
    for (const m of mouvements30j) {
      const key = startOfDay(m.createdAt).toISOString().slice(0, 10);
      parJour.set(key, (parJour.get(key) ?? 0) + m.quantite);
    }
    const mouvementsGraph = Array.from({ length: 30 }, (_, i) => {
      const d = addDays(debut30j, i);
      const key = d.toISOString().slice(0, 10);
      return { jour: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`, mouvements: parJour.get(key) ?? 0 };
    });

    type Activite = { id: string; type: "reception" | "sortie" | "alerte" | "pointage"; titre: string; detail: string; date: Date };
    const activitesBrutes: Activite[] = [
      ...receptionsRecentes.map((r) => ({
        id: `reception-${r.id}`,
        type: "reception" as const,
        titre: `Réception — ${r.produit.nom}`,
        detail: `${r.gerant.prenom} ${r.gerant.nom} · ${r.quantiteRecue}/${r.quantiteAttendue} · ${libelleEcart(r.ecart)}`,
        date: r.createdAt,
      })),
      ...mouvementsRecents.map((m) => ({
        id: `mouvement-${m.id}`,
        type: "sortie" as const,
        titre: `${m.type === "ENTREE" ? "Entrée" : "Sortie"} — ${m.lignes.map((l) => l.produit.nom).join(", ")}`,
        detail: `${m.employe.prenom} ${m.employe.nom} · ${m.lignes.reduce((s, l) => s + l.quantite, 0)} unités · ${MOTIF_LABELS[m.motif] ?? m.motif}`,
        date: m.createdAt,
      })),
      ...pointagesRecents.map((p) => ({
        id: `pointage-${p.id}`,
        type: "pointage" as const,
        titre: `${p.sortieAt ? "Sortie" : "Entrée"} — ${p.employe.prenom} ${p.employe.nom}`,
        detail: p.sortieAt ? "Pointage terminé" : "Présent à l'entrepôt",
        date: p.sortieAt ?? p.entreeAt,
      })),
      ...alertesRecentes.map((a) => ({
        id: `alerte-${a.id}`,
        type: "alerte" as const,
        titre: `Alerte écart — ${a.produit?.nom ?? "Produit"}`,
        detail: `${a.ecartQuantite} unités · ${a.statut}`,
        date: a.createdAt,
      })),
    ];
    const activites = activitesBrutes
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 6)
      .map((a) => ({ id: a.id, type: a.type, titre: a.titre, detail: a.detail, temps: formatRelative(a.date) }));

    return NextResponse.json({
      kpis: {
        stockTotal,
        commandesCeMois,
        commandesEnAttente,
        commandesVariation: variationPct(commandesCeMois, commandesMoisDernier),
        sortiesDuJour,
        mouvementsEscaladeCount: mouvementsEscalade.length,
        sortiesVariation: variationPct(sortiesDuJour, sortiesHier),
        alertesOuvertes,
        receptionsCeMois,
        employesActifs,
        produitsCatalogue,
      },
      mouvementsGraph,
      activites,
      mouvementsEscalade: mouvementsEscalade.map((m) => ({
        id: m.id,
        produit: m.lignes.map((l) => l.produit.nom).join(", "),
        employe: `${m.employe.prenom} ${m.employe.nom}`,
        qte: m.lignes.reduce((s, l) => s + l.quantite, 0),
      })),
    });
  } catch (err) {
    console.error("Erreur dashboard:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
