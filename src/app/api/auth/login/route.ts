import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "8h";

export async function POST(req: NextRequest) {
  const { nom, code } = await req.json();

  if (!nom || !code) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  }

  const nomAttendu = (process.env.GERANT_NOM ?? "").trim().toUpperCase();
  const codeAttendu = (process.env.GERANT_CODE ?? "").trim();

  if (nom.trim().toUpperCase() !== nomAttendu || code.trim() !== codeAttendu) {
    return NextResponse.json({ error: "Nom ou code incorrect" }, { status: 401 });
  }

  const token = jwt.sign(
    { nom: nomAttendu, role: "GERANT" },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  );

  const res = NextResponse.json({ ok: true });
  res.cookies.set("token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
  return res;
}