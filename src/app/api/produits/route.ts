import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const includeInactifs = req.nextUrl.searchParams.get("tous") === "1";
    const produits = await prisma.produit.findMany({
      where: includeInactifs ? {} : { actif: true },
      include: {
        cartonsChine: {
          select: { id: true, identifiant: true, photoUrl: true, commandeChine: { select: { id: true, reference: true } } },
        },
      },
      orderBy: [{ actif: "desc" }, { nom: "asc" }],
    });
    return NextResponse.json(produits);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
