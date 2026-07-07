import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MOTIF_VALUES } from "@/lib/motifs";

const TYPES = ["ENTREE", "SORTIE"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { type, employeId, motif, noteMotif } = body;
    const lignes: { produitId: string; quantite: number | string }[] | undefined = Array.isArray(body.lignes) ? body.lignes : undefined;

    const existing = await prisma.mouvement.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Mouvement introuvable" }, { status: 404 });
    }

    if (type !== undefined && !TYPES.includes(type)) {
      return NextResponse.json({ error: "Type invalide" }, { status: 400 });
    }
    if (motif !== undefined && !MOTIF_VALUES.includes(motif)) {
      return NextResponse.json({ error: "Motif invalide" }, { status: 400 });
    }

    let lignesValides: { produitId: string; quantite: number }[] | undefined;
    if (lignes) {
      lignesValides = lignes
        .map((l) => ({ produitId: l.produitId, quantite: Number(l.quantite) }))
        .filter((l) => l.produitId && Number.isFinite(l.quantite) && l.quantite > 0);
      if (lignesValides.length === 0) {
        return NextResponse.json({ error: "Au moins un produit avec une quantité valide est requis" }, { status: 400 });
      }
    }

    const mouvement = await prisma.$transaction(async (tx) => {
      if (lignesValides) {
        await tx.mouvementLigne.deleteMany({ where: { mouvementId: id } });
      }
      return tx.mouvement.update({
        where: { id },
        data: {
          type: type ?? undefined,
          employeId: employeId ?? undefined,
          motif: motif ?? undefined,
          noteMotif: noteMotif !== undefined ? noteMotif?.trim() || null : undefined,
          lignes: lignesValides ? { create: lignesValides.map((l) => ({ produitId: l.produitId, quantite: l.quantite })) } : undefined,
        },
        include: {
          employe: { select: { id: true, nom: true, prenom: true } },
          lignes: { include: { produit: { select: { id: true, nom: true } } } },
        },
      });
    });

    return NextResponse.json(mouvement);
  } catch (err) {
    console.error("Erreur édition mouvement:", err);
    return NextResponse.json({ error: "Erreur lors de la modification" }, { status: 500 });
  }
}
