import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export async function GET() {
  try {
    const debutMois = startOfMonth(new Date());

    const [alertes, ouvertes, enCours, resoluesCeMois] = await Promise.all([
      prisma.alerte.findMany({
        include: { produit: { select: { nom: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.alerte.count({ where: { statut: "OUVERTE" } }),
      prisma.alerte.count({ where: { statut: "EN_COURS" } }),
      prisma.alerte.count({ where: { statut: "RESOLUE", resolueAt: { gte: debutMois } } }),
    ]);

    return NextResponse.json({
      alertes: alertes.map((a) => ({
        id: a.id,
        produit: a.produit?.nom ?? null,
        ecartQuantite: a.ecartQuantite,
        periodeDebut: a.periodeDebut,
        periodeFin: a.periodeFin,
        gerantEnPoste: a.gerantEnPoste,
        employesConcernes: a.employesConcernes,
        statut: a.statut,
        createdAt: a.createdAt,
        resolueAt: a.resolueAt,
      })),
      stats: { ouvertes, enCours, resoluesCeMois },
    });
  } catch (err) {
    console.error("Erreur alertes:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
