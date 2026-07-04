import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const commande = await prisma.commande.findUnique({
      where: { id },
      include: {
        produit: { select: { id: true, nom: true, categorie: true, imageUrl: true } },
        livreur: { select: { id: true, nom: true, prenom: true, role: true } },
      },
    });
    if (!commande) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }
    return NextResponse.json(commande);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const data: Record<string, unknown> = {};
    if (body.statut) data.statut = body.statut;
    if (body.livreurId !== undefined) data.livreurId = body.livreurId || null;
    if (body.note !== undefined) data.note = body.note || null;
    if (body.statut === "LIVREE") data.livraisonAt = new Date();
    if (body.client !== undefined) data.client = body.client.trim();
    if (body.telephoneClient !== undefined) data.telephoneClient = body.telephoneClient?.trim() || null;
    if (body.adresseLivraison !== undefined) data.adresseLivraison = body.adresseLivraison?.trim() || null;
    if (body.produitId !== undefined) data.produitId = body.produitId;
    if (body.quantite !== undefined) data.quantite = Number(body.quantite);
    if (body.prixUnitaire !== undefined) data.prixUnitaire = body.prixUnitaire ? Number(body.prixUnitaire) : null;

    const commande = await prisma.commande.update({
      where: { id },
      data,
      include: {
        produit: { select: { id: true, nom: true } },
        livreur: { select: { id: true, nom: true, prenom: true } },
      },
    });
    return NextResponse.json(commande);
  } catch {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.commande.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
