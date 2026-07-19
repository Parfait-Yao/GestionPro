import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getGerantId } from "@/lib/gerant";
import { creerNotification } from "@/lib/notifications";
import { MOTIF_VALUES, MOTIF_VALUES_SORTIE, MOTIF_VALUES_ENTREE, MOUVEMENT_PAR_MOTIF_SORTIE, MOUVEMENT_ENTREE } from "@/lib/motifs";

const TYPES = ["ENTREE", "SORTIE"];

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get("type");
    const mouvements = await prisma.mouvement.findMany({
      where: type ? { type: type as never } : undefined,
      include: {
        employe: { select: { id: true, nom: true, prenom: true } },
        lignes: { include: { produit: { select: { id: true, nom: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(mouvements);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, employeId, motif, noteMotif } = body;
    const lignes: { produitId: string; quantite: number | string }[] = Array.isArray(body.lignes) ? body.lignes : [];

    if (!TYPES.includes(type) || !employeId || !MOTIF_VALUES.includes(motif)) {
      return NextResponse.json({ error: "Type, employé et motif requis" }, { status: 400 });
    }

    // Vérifier la cohérence motif/type
    if (type === "SORTIE" && !MOTIF_VALUES_SORTIE.includes(motif)) {
      return NextResponse.json({ error: "Motif invalide pour une sortie" }, { status: 400 });
    }
    if (type === "ENTREE" && !MOTIF_VALUES_ENTREE.includes(motif)) {
      return NextResponse.json({ error: "Une entrée doit avoir le motif Correction / retour" }, { status: 400 });
    }

    const lignesValides = lignes
      .map((l) => ({ produitId: l.produitId, quantite: Number(l.quantite) }))
      .filter((l) => l.produitId && Number.isFinite(l.quantite) && l.quantite > 0);

    if (lignesValides.length === 0) {
      return NextResponse.json({ error: "Au moins un produit avec une quantité valide est requis" }, { status: 400 });
    }

    const gerantId = await getGerantId();
    if (!gerantId) {
      return NextResponse.json({ error: "Aucun gérant configuré" }, { status: 500 });
    }

    const configSeuil = await prisma.configuration.findUnique({ where: { cle: "seuil_escalade_sortie" } });
    const seuilEscalade = Number(configSeuil?.valeur) || 50;
    const escalade = type === "SORTIE" && lignesValides.some((l) => l.quantite > seuilEscalade);

    const mouvementStockData = lignesValides.map((l) => {
      const mapping = type === "SORTIE" ? MOUVEMENT_PAR_MOTIF_SORTIE[motif as keyof typeof MOUVEMENT_PAR_MOTIF_SORTIE] : MOUVEMENT_ENTREE;
      return {
        produitId: l.produitId,
        gerantId,
        type: mapping.type,
        etatArrivee: mapping.etatArrivee as any,
        quantite: l.quantite,
      };
    });

    const [mouvement] = await prisma.$transaction([
      prisma.mouvement.create({
        data: {
          type,
          employeId,
          gerantId,
          motif,
          noteMotif: noteMotif?.trim() || null,
          statut: escalade ? "ESCALADE_PATRONNE" : "CONFIRMEE",
          lignes: { create: lignesValides.map((l) => ({ produitId: l.produitId, quantite: l.quantite })) },
        },
        include: {
          employe: { select: { id: true, nom: true, prenom: true } },
          lignes: { include: { produit: { select: { id: true, nom: true } } } },
        },
      }),
      ...mouvementStockData.map((data) => prisma.mouvementStock.create({ data })),
    ]);

    if (escalade) {
      const produits = mouvement.lignes.map((l) => `${l.produit.nom} (${l.quantite})`).join(", ");
      await creerNotification({
        type: "alerte",
        titre: "Écart stock détecté",
        message: `${produits} — sortie de ${mouvement.employe.prenom} ${mouvement.employe.nom}, escaladée à la patronne`,
        lien: `/alertes`,
      });
    }

    return NextResponse.json(mouvement, { status: 201 });
  } catch (err) {
    console.error("Erreur création mouvement:", err);
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
