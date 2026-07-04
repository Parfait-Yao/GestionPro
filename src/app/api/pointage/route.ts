import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getGerantId } from "@/lib/gerant";

export async function GET(req: NextRequest) {
  try {
    const dateParam = req.nextUrl.searchParams.get("date");
    const open = req.nextUrl.searchParams.get("open");

    const where: { entreeAt?: { gte: Date; lt: Date }; sortieAt?: null } = {};

    if (dateParam) {
      const start = new Date(`${dateParam}T00:00:00`);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      where.entreeAt = { gte: start, lt: end };
    }
    if (open === "true") {
      where.sortieAt = null;
    }

    const pointages = await prisma.pointage.findMany({
      where,
      include: { employe: { select: { id: true, nom: true, prenom: true, role: true } } },
      orderBy: { entreeAt: "desc" },
    });

    return NextResponse.json(pointages);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeId } = body;

    if (!employeId) {
      return NextResponse.json({ error: "Employé requis" }, { status: 400 });
    }

    const dejaPresent = await prisma.pointage.findFirst({
      where: { employeId, sortieAt: null },
    });
    if (dejaPresent) {
      return NextResponse.json({ error: "Cet employé est déjà pointé en entrée" }, { status: 409 });
    }

    const gerantId = await getGerantId();
    if (!gerantId) {
      return NextResponse.json({ error: "Aucun gérant configuré" }, { status: 500 });
    }

    const pointage = await prisma.pointage.create({
      data: { employeId, gerantId },
      include: { employe: { select: { id: true, nom: true, prenom: true, role: true } } },
    });

    return NextResponse.json(pointage, { status: 201 });
  } catch (err) {
    console.error("Erreur création pointage:", err);
    return NextResponse.json({ error: "Erreur lors du pointage" }, { status: 500 });
  }
}
