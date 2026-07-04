import { NextRequest, NextResponse } from "next/server";
import { genererPdfRapport } from "@/lib/pdf-rapport";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

async function lireConfig(cle: string, defaut: string): Promise<string> {
  const c = await prisma.configuration.findUnique({ where: { cle } });
  return c?.valeur ?? process.env[cle.toUpperCase()] ?? defaut;
}

async function uploadMedia(pdfBuffer: Buffer, token: string, phoneNumberId: string): Promise<string> {
  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("type", "application/pdf");
  form.append(
    "file",
    new Blob([new Uint8Array(pdfBuffer)], { type: "application/pdf" }),
    "rapport.pdf"
  );

  const res = await fetch(
    `https://graph.facebook.com/v20.0/${phoneNumberId}/media`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erreur upload média WhatsApp : ${err}`);
  }

  const json = await res.json() as { id: string };
  return json.id;
}

async function envoyerDocument(
  mediaId: string,
  destinataire: string,
  caption: string,
  token: string,
  phoneNumberId: string
) {
  const res = await fetch(
    `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: destinataire,
        type: "document",
        document: {
          id: mediaId,
          filename: "rapport.pdf",
          caption,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erreur envoi message WhatsApp : ${err}`);
  }

  return res.json();
}

export async function POST(req: NextRequest) {
  const { dateDebut: debutStr, dateFin: finStr } = await req.json() as {
    dateDebut?: string;
    dateFin?: string;
  };

  const dateDebut = debutStr
    ? new Date(debutStr)
    : new Date(new Date().setHours(0, 0, 0, 0));
  const dateFin = finStr
    ? new Date(finStr)
    : new Date(new Date().setHours(23, 59, 59, 999));

  const token = process.env.WHATSAPP_TOKEN ?? "";
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID ?? "";
  const numero = await lireConfig("whatsapp_numero_patronne", process.env.WHATSAPP_NUMERO_PATRONNE ?? "");

  if (!token || !phoneNumberId) {
    return NextResponse.json(
      {
        error:
          "WhatsApp non configuré. Veuillez renseigner WHATSAPP_TOKEN et WHATSAPP_PHONE_NUMBER_ID dans .env.local.",
      },
      { status: 503 }
    );
  }

  if (!numero) {
    return NextResponse.json(
      { error: "Numéro WhatsApp de la patronne non configuré." },
      { status: 400 }
    );
  }

  let succes = false;
  let erreurMsg: string | null = null;

  try {
    const pdfBuffer = await genererPdfRapport(dateDebut, dateFin);

    const mediaId = await uploadMedia(pdfBuffer, token, phoneNumberId);

    const caption = `📊 Rapport du ${format(dateDebut, "dd MMMM yyyy", { locale: fr })}`;
    await envoyerDocument(mediaId, numero, caption, token, phoneNumberId);

    succes = true;
  } catch (e) {
    erreurMsg = e instanceof Error ? e.message : String(e);
  }

  // Journalisation en base
  await prisma.notification.create({
    data: {
      canal: "WHATSAPP",
      destinataire: numero,
      contenu: `Rapport du ${format(dateDebut, "dd/MM/yyyy")} au ${format(dateFin, "dd/MM/yyyy")}`,
      succes,
      erreur: erreurMsg,
    },
  });

  if (!succes) {
    return NextResponse.json({ error: erreurMsg }, { status: 500 });
  }

  return NextResponse.json({ ok: true, destinataire: numero });
}
