import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const employe = await prisma.employe.update({
      where: { id },
      data: {
        ...(body.nom && { nom: body.nom.trim().toUpperCase() }),
        ...(body.prenom && { prenom: body.prenom.trim() }),
        ...(body.role && { role: body.role }),
        ...(body.telephone !== undefined && { telephone: body.telephone || null }),
        ...(body.actif !== undefined && { actif: body.actif }),
      },
    });
    return NextResponse.json(employe);
  } catch {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.employe.update({ where: { id }, data: { actif: false } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
