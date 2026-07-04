import { prisma } from "@/lib/prisma";

export type NotificationType = "commande" | "reception" | "produit" | "employe" | "alerte";

export async function creerNotification(params: {
  type: NotificationType;
  titre: string;
  message: string;
  lien?: string;
}) {
  try {
    await prisma.notificationApp.create({ data: params });
  } catch (err) {
    console.error("Erreur création notification:", err);
  }
}
