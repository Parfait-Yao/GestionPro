import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getGerantId } from "@/lib/gerant";

const MOTIFS = ["VENTE", "TRANSFORMATION", "USAGE_INTERNE", "REMPLACEMENT_DEFECTUEUX", "AUTRE"];

export async function GET(req: NextRequest) {
  try {
    const statut = req.nextUrl.searchParams.get("statut");
    const sorties = await prisma.sortie.findMany({
      where: statut ? { statut: statut as never } : undefined,
      include: {
        produit: { select: { id: true, nom: true, seuilSensibleQte: true } },
        employe: { select: { id: true, nom: true, prenom: true } },
      },
      orderBy: { annonceAt: "desc" },
    });
    return NextResponse.json(sorties);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { produitId, employeId, motif, noteMotif } = body;
    const quantiteAnnoncee = Number(body.quantiteAnnoncee);

    if (!produitId || !employeId || !MOTIFS.includes(motif)) {
      return NextResponse.json({ error: "Produit, employé et motif requis" }, { status: 400 });
    }
    if (!quantiteAnnoncee || quantiteAnnoncee <= 0) {
      return NextResponse.json({ error: "Quantité annoncée invalide" }, { status: 400 });
    }

    const gerantId = await getGerantId();
    if (!gerantId) {
      return NextResponse.json({ error: "Aucun gérant configuré" }, { status: 500 });
    }

    const sortie = await prisma.sortie.create({
      data: {
        produitId,
        employeId,
        gerantId,
        motif,
        quantiteAnnoncee,
        noteMotif: noteMotif?.trim() || null,
        statut: "EN_ATTENTE",
      },
      include: {
        produit: { select: { id: true, nom: true, seuilSensibleQte: true } },
        employe: { select: { id: true, nom: true, prenom: true } },
      },
    });

    return NextResponse.json(sortie, { status: 201 });
  } catch (err) {
    console.error("Erreur création sortie:", err);
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
