import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; cartonId: string }> }
) {
  try {
    const { id: commandeChineId, cartonId } = await params;
    const body = await req.json();

    const data: Record<string, unknown> = {};
    if (body.identifiant !== undefined) {
      const identifiant = String(body.identifiant).trim();
      if (!identifiant) {
        return NextResponse.json({ error: "Identifiant du carton requis" }, { status: 400 });
      }
      const exists = await prisma.cartonChine.findUnique({
        where: { commandeChineId_identifiant: { commandeChineId, identifiant } },
      });
      if (exists && exists.id !== cartonId) {
        return NextResponse.json({ error: "Un carton avec cet identifiant existe déjà pour cette commande" }, { status: 409 });
      }
      data.identifiant = identifiant;
    }
    if (body.photoUrl !== undefined) data.photoUrl = body.photoUrl || null;

    const carton = await prisma.cartonChine.update({
      where: { id: cartonId },
      data,
    });
    return NextResponse.json(carton);
  } catch {
    return NextResponse.json({ error: "Erreur lors de la mise à jour du carton" }, { status: 500 });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ cartonId: string }> }
) {
  try {
    const { cartonId } = await params;
    await prisma.cartonChine.delete({ where: { id: cartonId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la suppression du carton" }, { status: 500 });
  }
}
