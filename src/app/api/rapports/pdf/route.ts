import { NextRequest, NextResponse } from "next/server";
import { genererPdfRapport } from "@/lib/pdf-rapport";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const debut = searchParams.get("dateDebut");
  const fin = searchParams.get("dateFin");

  const dateDebut = debut
    ? new Date(debut)
    : new Date(new Date().setHours(0, 0, 0, 0));
  const dateFin = fin
    ? new Date(fin)
    : new Date(new Date().setHours(23, 59, 59, 999));

  const buffer = await genererPdfRapport(dateDebut, dateFin);

  const nomFichier = `rapport-${format(dateDebut, "yyyy-MM-dd")}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${nomFichier}"`,
    },
  });
}
