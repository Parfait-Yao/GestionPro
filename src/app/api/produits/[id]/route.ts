import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

const INT4_MAX = 2147483647;

// Accepte la virgule comme séparateur décimal ; retourne NaN si non numérique.
function parseNumber(value: unknown): number {
  return Number(String(value).replace(",", "."));
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const produit = await prisma.produit.findUnique({ where: { id } });
    if (!produit) {
      return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
    }
    return NextResponse.json(produit);
  } catch (err) {
    console.error("Erreur récupération produit:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const qte = body.quantite !== undefined ? parseNumber(body.quantite) : undefined;

    if (qte !== undefined && Number.isNaN(qte)) {
      return NextResponse.json({ error: "La quantité est invalide" }, { status: 400 });
    }
    if (qte !== undefined && (!Number.isInteger(qte) || qte > INT4_MAX || qte < -INT4_MAX)) {
      return NextResponse.json({ error: "La quantité doit être un nombre entier valide" }, { status: 400 });
    }

    const produit = await prisma.produit.update({
      where: { id },
      data: {
        ...(body.nom && { nom: body.nom.trim() }),
        ...(body.categorie !== undefined && { categorie: body.categorie?.trim() || null }),
        ...(body.description !== undefined && { description: body.description?.trim() || null }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl || null }),
        ...(qte !== undefined && { quantite: qte }),
        ...(body.actif !== undefined && { actif: body.actif }),
      },
    });
    return NextResponse.json(produit);
  } catch (err) {
    console.error("Erreur mise à jour produit:", err);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.produit.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return NextResponse.json(
        { error: "Ce produit est utilisé dans des mouvements, réceptions ou commandes et ne peut pas être supprimé définitivement." },
        { status: 409 }
      );
    }
    console.error("Erreur suppression produit:", err);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
