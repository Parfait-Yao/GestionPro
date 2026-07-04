import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { creerNotification } from "@/lib/notifications";

export async function GET() {
  try {
    const employes = await prisma.employe.findMany({
      orderBy: [{ actif: "desc" }, { nom: "asc" }],
    });
    return NextResponse.json(employes);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nom, prenom, role, telephone } = body;

    if (!nom || !prenom) {
      return NextResponse.json({ error: "Nom et prénom requis" }, { status: 400 });
    }

    const employe = await prisma.employe.create({
      data: {
        nom: nom.trim().toUpperCase(),
        prenom: prenom.trim(),
        role: role ?? "AUTRE",
        telephone: telephone?.trim() || null,
        actif: true,
      },
    });

    await creerNotification({
      type: "employe",
      titre: "Nouvel employé",
      message: `${employe.prenom} ${employe.nom} ajouté(e) comme ${employe.role}`,
      lien: `/employes`,
    });

    return NextResponse.json(employe, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
