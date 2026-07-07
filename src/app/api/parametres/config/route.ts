import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CLES_AUTORISEES = [
  "whatsapp_numero_patronne",
  "rapport_heure_auto",
  "rapport_auto_actif",
  "seuil_escalade_sortie",
];

export async function GET() {
  const configs = await prisma.configuration.findMany({
    where: { cle: { in: CLES_AUTORISEES } },
  });

  const result: Record<string, string> = {};
  for (const c of configs) {
    result[c.cle] = c.valeur;
  }

  // Valeurs par défaut depuis les variables d'environnement
  if (!result.whatsapp_numero_patronne && process.env.WHATSAPP_NUMERO_PATRONNE) {
    result.whatsapp_numero_patronne = process.env.WHATSAPP_NUMERO_PATRONNE;
  }
  if (!result.rapport_heure_auto) result.rapport_heure_auto = "18:00";
  if (!result.rapport_auto_actif) result.rapport_auto_actif = "false";
  if (!result.seuil_escalade_sortie) result.seuil_escalade_sortie = "50";

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const updates = Object.entries(body).filter(([cle]) =>
    CLES_AUTORISEES.includes(cle)
  ) as [string, string][];

  await Promise.all(
    updates.map(([cle, valeur]) =>
      prisma.configuration.upsert({
        where: { cle },
        update: { valeur: String(valeur) },
        create: { cle, valeur: String(valeur) },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
