import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: commandeChineId } = await params;
    const body = await req.json();
    const { identifiant, photoUrl } = body;

    if (!identifiant || !String(identifiant).trim()) {
      return NextResponse.json({ error: "Identifiant du carton requis" }, { status: 400 });
    }

    const commande = await prisma.commandeChine.findUnique({ where: { id: commandeChineId } });
    if (!commande) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    const exists = await prisma.cartonChine.findUnique({
      where: { commandeChineId_identifiant: { commandeChineId, identifiant: String(identifiant).trim() } },
    });
    if (exists) {
      return NextResponse.json({ error: "Un carton avec cet identifiant existe déjà pour cette commande" }, { status: 409 });
    }

    const carton = await prisma.cartonChine.create({
      data: {
        commandeChineId,
        identifiant: String(identifiant).trim(),
        photoUrl: photoUrl || null,
      },
    });

    return NextResponse.json(carton, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la création du carton" }, { status: 500 });
  }
}
