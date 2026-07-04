import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { creerNotification } from "@/lib/notifications";

const MOUVEMENT_PAR_MOTIF: Record<string, { type: "VENTE" | "TRANSFORMATION_DEBUT" | "USAGE_INTERNE" | "REMPLACEMENT_DEFECTUEUX" | "CORRECTION_INVENTAIRE"; etatArrivee: "VENDU" | "EN_TRANSFORMATION" | "UTILISE_INTERNE" }> = {
  VENTE: { type: "VENTE", etatArrivee: "VENDU" },
  TRANSFORMATION: { type: "TRANSFORMATION_DEBUT", etatArrivee: "EN_TRANSFORMATION" },
  USAGE_INTERNE: { type: "USAGE_INTERNE", etatArrivee: "UTILISE_INTERNE" },
  REMPLACEMENT_DEFECTUEUX: { type: "REMPLACEMENT_DEFECTUEUX", etatArrivee: "VENDU" },
  AUTRE: { type: "CORRECTION_INVENTAIRE", etatArrivee: "VENDU" },
};

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const quantiteConfirmee = Number(body.quantiteConfirmee);

    if (!Number.isFinite(quantiteConfirmee) || quantiteConfirmee < 0) {
      return NextResponse.json({ error: "Quantité confirmée invalide" }, { status: 400 });
    }

    const sortie = await prisma.sortie.findUnique({
      where: { id },
      include: { produit: { select: { seuilSensibleQte: true } } },
    });
    if (!sortie) {
      return NextResponse.json({ error: "Sortie introuvable" }, { status: 404 });
    }
    if (sortie.statut !== "EN_ATTENTE") {
      return NextResponse.json({ error: "Cette sortie a déjà été traitée" }, { status: 409 });
    }

    const escalade = quantiteConfirmee > sortie.produit.seuilSensibleQte;
    const now = new Date();
    const mouvement = MOUVEMENT_PAR_MOTIF[sortie.motif];

    const [updated] = await prisma.$transaction([
      prisma.sortie.update({
        where: { id },
        data: {
          quantiteConfirmee,
          ecartConstate: quantiteConfirmee - sortie.quantiteAnnoncee,
          statut: escalade ? "ESCALADE_PATRONNE" : "CONFIRMEE",
          confirmationAt: now,
          escaladeAt: escalade ? now : null,
        },
        include: {
          produit: { select: { id: true, nom: true, seuilSensibleQte: true } },
          employe: { select: { id: true, nom: true, prenom: true } },
        },
      }),
      prisma.mouvementStock.create({
        data: {
          produitId: sortie.produitId,
          gerantId: sortie.gerantId,
          type: mouvement.type,
          etatArrivee: mouvement.etatArrivee,
          quantite: quantiteConfirmee,
        },
      }),
    ]);

    if (escalade) {
      await creerNotification({
        type: "alerte",
        titre: "Écart stock détecté",
        message: `${updated.produit.nom} : ${quantiteConfirmee} unités confirmées par ${updated.employe.prenom} ${updated.employe.nom}, escaladé à la patronne`,
        lien: `/alertes`,
      });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Erreur confirmation sortie:", err);
    return NextResponse.json({ error: "Erreur lors de la confirmation" }, { status: 500 });
  }
}
