import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getGerantId } from "@/lib/gerant";
import { creerNotification } from "@/lib/notifications";

export async function GET() {
  try {
    const receptions = await prisma.reception.findMany({
      include: {
        produit: { select: { id: true, nom: true } },
        gerant: { select: { id: true, nom: true, prenom: true } },
        commandeChine: { select: { id: true, reference: true } },
        cartonChine: { select: { id: true, identifiant: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(receptions);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { produitId, commandeChineId, cartonChineId, note } = body;

    if (!produitId) {
      return NextResponse.json({ error: "Produit requis" }, { status: 400 });
    }

    const quantiteAttendue = Number(body.quantiteAttendue) || 0;
    if (quantiteAttendue <= 0) {
      return NextResponse.json({ error: "Quantité attendue invalide" }, { status: 400 });
    }

    const quantiteRecue = Number(body.quantiteRecue);
    if (!Number.isFinite(quantiteRecue) || quantiteRecue < 0) {
      return NextResponse.json({ error: "Quantité reçue invalide" }, { status: 400 });
    }

    const gerantId = await getGerantId();
    if (!gerantId) {
      return NextResponse.json({ error: "Aucun gérant configuré" }, { status: 500 });
    }

    const ecart = quantiteRecue - quantiteAttendue;

    const [reception] = await prisma.$transaction([
      prisma.reception.create({
        data: {
          produitId,
          gerantId,
          commandeChineId: commandeChineId || null,
          cartonChineId: cartonChineId || null,
          quantiteAttendue,
          quantiteRecue,
          ecart,
          noteGerant: note?.trim() || null,
          valide: true,
        },
        include: {
          produit: { select: { id: true, nom: true } },
          gerant: { select: { id: true, nom: true, prenom: true } },
          commandeChine: { select: { id: true, reference: true } },
          cartonChine: { select: { id: true, identifiant: true } },
        },
      }),
      prisma.mouvementStock.create({
        data: {
          produitId,
          gerantId,
          type: "RECEPTION",
          etatArrivee: "EN_STOCK_BRUT",
          quantite: quantiteRecue,
        },
      }),
    ]);

    await creerNotification({
      type: "reception",
      titre: "Nouvelle réception",
      message: `${reception.quantiteRecue} unités de ${reception.produit.nom} reçues`,
      lien: `/receptions`,
    });

    return NextResponse.json(reception, { status: 201 });
  } catch (err) {
    console.error("Erreur création réception:", err);
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
