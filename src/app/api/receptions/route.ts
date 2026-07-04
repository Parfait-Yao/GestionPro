import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getGerantId } from "@/lib/gerant";
import { calculerPesee } from "@/lib/utils";
import { creerNotification } from "@/lib/notifications";

export async function GET() {
  try {
    const receptions = await prisma.reception.findMany({
      include: {
        produit: { select: { id: true, nom: true, seuilTolerancePct: true } },
        gerant: { select: { id: true, nom: true, prenom: true } },
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
    const { produitId, methode, note } = body;

    if (!produitId || (methode !== "PESEE_ASSISTEE" && methode !== "COMPTAGE_GROUPE")) {
      return NextResponse.json({ error: "Produit et méthode requis" }, { status: 400 });
    }

    const quantiteAttendue = Number(body.quantiteAttendue) || 0;
    if (quantiteAttendue <= 0) {
      return NextResponse.json({ error: "Quantité attendue invalide" }, { status: 400 });
    }

    const gerantId = await getGerantId();
    if (!gerantId) {
      return NextResponse.json({ error: "Aucun gérant configuré" }, { status: 500 });
    }

    let quantiteEstimee: number;
    let data: Record<string, unknown> = {};

    if (methode === "PESEE_ASSISTEE") {
      const poidsEchantillon = Number(body.poidsEchantillon);
      const nbUnitesEchantillon = Number(body.nbUnitesEchantillon);
      const poidsCartonPlein = Number(body.poidsCartonPlein);
      const tarreUtilisee = Number(body.tarreUtilisee) || 0;

      const calc = calculerPesee({ poidsEchantillon, nbUnitesEchantillon, poidsCartonPlein, tarreUtilisee, quantiteAttendue });
      if (!calc) {
        return NextResponse.json({ error: "Données de pesée incomplètes" }, { status: 400 });
      }

      quantiteEstimee = calc.quantiteEstimee;
      data = {
        poidsEchantillon, nbUnitesEchantillon, poidsCartonPlein, tarreUtilisee,
        intervalleMin: calc.intervalleMin, intervalleMax: calc.intervalleMax,
      };
    } else {
      const nbTas = Number(body.nbTas);
      const unitesParTas = Number(body.unitesParTas);
      if (!nbTas || !unitesParTas) {
        return NextResponse.json({ error: "Nombre de tas et unités par tas requis" }, { status: 400 });
      }
      quantiteEstimee = nbTas * unitesParTas;
      data = { nbTas, unitesParTas };
    }

    const ecartPct = ((quantiteEstimee - quantiteAttendue) / quantiteAttendue) * 100;

    const [reception] = await prisma.$transaction([
      prisma.reception.create({
        data: {
          produitId,
          gerantId,
          methode,
          quantiteAttendue,
          quantiteEstimee,
          ecartPct,
          noteGerant: note?.trim() || null,
          valide: true,
          ...data,
        },
        include: {
          produit: { select: { id: true, nom: true, seuilTolerancePct: true } },
          gerant: { select: { id: true, nom: true, prenom: true } },
        },
      }),
      prisma.mouvementStock.create({
        data: {
          produitId,
          gerantId,
          type: "RECEPTION",
          etatArrivee: "EN_STOCK_BRUT",
          quantite: quantiteEstimee,
        },
      }),
    ]);

    await creerNotification({
      type: "reception",
      titre: "Nouvelle réception",
      message: `${reception.quantiteEstimee} unités de ${reception.produit.nom} reçues`,
      lien: `/receptions`,
    });

    return NextResponse.json(reception, { status: 201 });
  } catch (err) {
    console.error("Erreur création réception:", err);
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
