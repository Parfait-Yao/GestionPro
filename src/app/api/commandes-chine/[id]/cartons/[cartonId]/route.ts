import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { creerNotification } from "@/lib/notifications";
import { getGerantId } from "@/lib/gerant";
import { recalculerQuantiteProduit } from "@/lib/stock";

const INT4_MAX = 2147483647;

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

    if (body.produit !== undefined) {
      const { produit } = body;
      if (!produit?.nom || !String(produit.nom).trim()) {
        return NextResponse.json({ error: "Le nom du produit est requis" }, { status: 400 });
      }
      const qte = Number(produit.quantite) || 0;
      if (!Number.isInteger(qte) || qte > INT4_MAX || qte < -INT4_MAX) {
        return NextResponse.json({ error: "La quantité du produit est invalide" }, { status: 400 });
      }

      const gerantId = await getGerantId();
      if (!gerantId) {
        return NextResponse.json({ error: "Aucun gérant configuré" }, { status: 500 });
      }

      const carton = await prisma.$transaction(async (tx) => {
        const createdProduit = await tx.produit.create({
          data: {
            nom: String(produit.nom).trim(),
            categorie: produit.categorie?.trim() || null,
            description: produit.description?.trim() || null,
            imageUrl: produit.imageUrl || null,
            quantite: 0,
            actif: true,
          },
        });

        // Enregistrer un produit sur un carton EST une réception : la quantité saisie
        // ici alimente la même source de vérité que /receptions, plutôt que d'écrire
        // Produit.quantite directement (champ dérivé désormais, jamais fixé à la main).
        if (qte > 0) {
          await tx.reception.create({
            data: {
              produitId: createdProduit.id,
              gerantId,
              commandeChineId,
              cartonChineId: cartonId,
              quantiteAttendue: qte,
              quantiteRecue: qte,
              ecart: 0,
              valide: true,
            },
          });
          await recalculerQuantiteProduit(tx, createdProduit.id);
        }

        return tx.cartonChine.update({
          where: { id: cartonId },
          data: { ...data, produitId: createdProduit.id },
          include: { produit: true },
        });
      });

      await creerNotification({
        type: "produit",
        titre: "Nouveau produit",
        message: `${carton.produit!.nom} ajouté au catalogue`,
        lien: `/produits/${carton.produit!.id}/modifier`,
      });

      return NextResponse.json(carton);
    }

    const carton = await prisma.cartonChine.update({
      where: { id: cartonId },
      data,
      include: { produit: true },
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
