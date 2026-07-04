import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Point d'entrée pour l'envoi automatique quotidien du rapport.
 *
 * Pour l'activer, appelez cette URL chaque jour à l'heure souhaitée via :
 *   - Windows Task Scheduler (tâche planifiée Windows)
 *   - Un service cron externe comme https://cron-job.org
 *   - curl http://localhost:3000/api/cron/rapport-quotidien
 *
 * Protégé par un token secret (CRON_SECRET dans .env.local).
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") ?? req.nextUrl.searchParams.get("secret");
  const attendu = process.env.CRON_SECRET;

  if (attendu && secret !== attendu) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const config = await prisma.configuration.findMany({
    where: { cle: { in: ["rapport_auto_actif", "rapport_heure_auto"] } },
  });
  const cfg = Object.fromEntries(config.map((c: { cle: string; valeur: string }) => [c.cle, c.valeur]));

  if (cfg.rapport_auto_actif !== "true") {
    return NextResponse.json({ message: "Envoi automatique désactivé." });
  }

  // Déclencher l'envoi via la route WhatsApp
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const today = new Date();
  const dateDebut = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const dateFin = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  const res = await fetch(`${appUrl}/api/rapports/whatsapp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dateDebut, dateFin }),
  });

  const json = await res.json();

  if (!res.ok) {
    return NextResponse.json({ error: json.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: "Rapport envoyé avec succès." });
}
