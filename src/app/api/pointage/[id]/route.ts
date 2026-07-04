import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const pointage = await prisma.pointage.findUnique({ where: { id } });
    if (!pointage) {
      return NextResponse.json({ error: "Pointage introuvable" }, { status: 404 });
    }
    if (pointage.sortieAt) {
      return NextResponse.json({ error: "Sortie déjà enregistrée" }, { status: 409 });
    }

    const updated = await prisma.pointage.update({
      where: { id },
      data: { sortieAt: new Date() },
      include: { employe: { select: { id: true, nom: true, prenom: true, role: true } } },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Erreur sortie pointage:", err);
    return NextResponse.json({ error: "Erreur lors de la sortie" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.pointage.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erreur suppression pointage:", err);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
