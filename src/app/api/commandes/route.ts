import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { creerNotification } from "@/lib/notifications";

function genRef() {
  const now = new Date();
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `CMD-${ymd}-${rand}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statut = searchParams.get("statut");

    const commandes = await prisma.commande.findMany({
      where: statut ? { statut: statut as never } : undefined,
      include: {
        produit: { select: { id: true, nom: true, categorie: true, imageUrl: true } },
        livreur: { select: { id: true, nom: true, prenom: true, role: true } },
        gerant: { select: { id: true, nom: true, prenom: true } },
      },
      orderBy: { commandeAt: "desc" },
    });

    return NextResponse.json(commandes);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { client, telephoneClient, adresseLivraison, produitId, quantite, prixUnitaire, livreurId, gerantId, note } = body;

    if (!client || !produitId || !quantite || !gerantId) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    let reference = genRef();
    let tries = 0;
    while (tries < 5) {
      const exists = await prisma.commande.findUnique({ where: { reference } });
      if (!exists) break;
      reference = genRef();
      tries++;
    }

    const commande = await prisma.commande.create({
      data: {
        reference,
        client: client.trim(),
        telephoneClient: telephoneClient?.trim() || null,
        adresseLivraison: adresseLivraison?.trim() || null,
        produitId,
        quantite: Number(quantite),
        prixUnitaire: prixUnitaire ? Number(prixUnitaire) : null,
        livreurId: livreurId || null,
        gerantId,
        note: note?.trim() || null,
        statut: "EN_ATTENTE",
      },
      include: {
        produit: { select: { id: true, nom: true } },
        livreur: { select: { id: true, nom: true, prenom: true } },
      },
    });

    await creerNotification({
      type: "commande",
      titre: "Nouvelle commande",
      message: `${commande.client} — ${commande.quantite} × ${commande.produit.nom}`,
      lien: `/commandes/${commande.id}/modifier`,
    });

    return NextResponse.json(commande, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
