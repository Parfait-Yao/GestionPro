import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [notifications, nonLues] = await Promise.all([
      prisma.notificationApp.findMany({
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.notificationApp.count({ where: { lue: false } }),
    ]);

    return NextResponse.json({ notifications, nonLues });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    await prisma.notificationApp.updateMany({
      where: { lue: false },
      data: { lue: true },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}
