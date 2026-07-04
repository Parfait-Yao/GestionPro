import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const utilisateurs = await prisma.utilisateur.findMany({
    where: { actif: true },
    select: { id: true, nom: true, prenom: true, role: true },
    orderBy: [{ role: "asc" }, { nom: "asc" }],
  });
  return NextResponse.json(utilisateurs);
}
