import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const commandes = await prisma.commandeChine.findMany({
      include: { cartons: { include: { produit: true }, orderBy: { identifiant: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(commandes);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reference, note } = body;

    if (!reference || !String(reference).trim()) {
      return NextResponse.json({ error: "Référence requise" }, { status: 400 });
    }

    const ref = String(reference).trim().toUpperCase();

    const exists = await prisma.commandeChine.findUnique({ where: { reference: ref } });
    if (exists) {
      return NextResponse.json({ error: "Cette référence existe déjà" }, { status: 409 });
    }

    const commande = await prisma.commandeChine.create({
      data: { reference: ref, note: note?.trim() || null },
      include: { cartons: true },
    });

    return NextResponse.json(commande, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
