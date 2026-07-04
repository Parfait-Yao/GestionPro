import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const notification = await prisma.notificationApp.update({
      where: { id },
      data: { lue: true },
    });
    return NextResponse.json(notification);
  } catch {
    return NextResponse.json({ error: "Notification introuvable" }, { status: 404 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.notificationApp.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Notification introuvable" }, { status: 404 });
  }
}
