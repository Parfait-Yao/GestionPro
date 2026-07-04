import { prisma } from "@/lib/prisma";

// L'app n'a qu'un seul compte gérant (login via GERANT_NOM/GERANT_CODE, le JWT ne
// porte pas d'id) — on résout donc l'utilisateur gérant en base pour les FK.
export async function getGerantId(): Promise<string | null> {
  const gerant = await prisma.utilisateur.findFirst({
    where: { role: "GERANT", actif: true },
    select: { id: true },
  });
  return gerant?.id ?? null;
}
