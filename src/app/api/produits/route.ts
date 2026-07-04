import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { creerNotification } from "@/lib/notifications";

const INT4_MAX = 2147483647;

// Accepte la virgule comme séparateur décimal ; retourne NaN si non numérique.
function parseNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  return Number(String(value).replace(",", "."));
}

export async function GET(req: NextRequest) {
  try {
    const includeInactifs = req.nextUrl.searchParams.get("tous") === "1";
    const produits = await prisma.produit.findMany({
      where: includeInactifs ? {} : { actif: true },
      orderBy: [{ actif: "desc" }, { nom: "asc" }],
    });
    return NextResponse.json(produits);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nom, categorie, description, imageUrl, poidsUnitaireRef, tarreCarton, seuilTolerancePct, seuilSensibleQte } = body;

    if (!nom) {
      return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
    }

    const poids = parseNumber(poidsUnitaireRef);
    const tare = parseNumber(tarreCarton);
    const tolerance = parseNumber(seuilTolerancePct) ?? 3.0;
    const seuilQte = parseNumber(seuilSensibleQte) ?? 50;

    if ([poids, tare, tolerance, seuilQte].some((n) => n !== null && Number.isNaN(n))) {
      return NextResponse.json({ error: "Un des champs numériques est invalide" }, { status: 400 });
    }
    if (!Number.isInteger(seuilQte) || seuilQte > INT4_MAX || seuilQte < -INT4_MAX) {
      return NextResponse.json({ error: "Le seuil escalade doit être un nombre entier valide" }, { status: 400 });
    }

    const produit = await prisma.produit.create({
      data: {
        nom: nom.trim(),
        categorie: categorie?.trim() || null,
        description: description?.trim() || null,
        imageUrl: imageUrl || null,
        poidsUnitaireRef: poids,
        tarreCarton: tare,
        seuilTolerancePct: tolerance,
        seuilSensibleQte: seuilQte,
        actif: true,
      },
    });

    await creerNotification({
      type: "produit",
      titre: "Nouveau produit",
      message: `${produit.nom} ajouté au catalogue`,
      lien: `/produits/${produit.id}/modifier`,
    });

    return NextResponse.json(produit, { status: 201 });
  } catch (err) {
    console.error("Erreur création produit:", err);
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
