import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const commande = await prisma.commandeChine.findUnique({
      where: { id },
      include: { cartons: { orderBy: { identifiant: "asc" } } },
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
    if (body.reference !== undefined) {
      const ref = String(body.reference).trim().toUpperCase();
      if (!ref) {
        return NextResponse.json({ error: "Référence requise" }, { status: 400 });
      }
      const exists = await prisma.commandeChine.findUnique({ where: { reference: ref } });
      if (exists && exists.id !== id) {
        return NextResponse.json({ error: "Cette référence existe déjà" }, { status: 409 });
      }
      data.reference = ref;
    }
    if (body.note !== undefined) data.note = body.note?.trim() || null;

    const commande = await prisma.commandeChine.update({
      where: { id },
      data,
      include: { cartons: { orderBy: { identifiant: "asc" } } },
    });
    return NextResponse.json(commande);
  } catch {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.commandeChine.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
