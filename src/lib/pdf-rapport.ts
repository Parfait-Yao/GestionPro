import PDFDocument from "pdfkit";
import { prisma } from "./prisma";
import { format, differenceInMinutes } from "date-fns";
import { fr } from "date-fns/locale";

const VERT_FONCE = "#1a472a";
const VERT = "#2d6a4f";
const VERT_CLAIR = "#d8f3dc";
const GRIS_LIGNE = "#f5f5f5";
const TEXTE = "#111111";

const PAGE_W = 595.28;
const MARGE = 40;
const CONTENU_W = PAGE_W - MARGE * 2;
const PAGE_H = 841.89;
const PIED_H = 50;
const MAX_Y = PAGE_H - MARGE - PIED_H;

function fmt(d: Date) {
  return format(d, "dd/MM/yyyy HH:mm", { locale: fr });
}
function fmtDate(d: Date) {
  return format(d, "dd/MM/yyyy", { locale: fr });
}
function fmtHeure(d: Date) {
  return format(d, "HH:mm", { locale: fr });
}
function duree(entree: Date, sortie: Date | null) {
  if (!sortie) return "En cours";
  const mins = differenceInMinutes(sortie, entree);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h${m.toString().padStart(2, "0")}`;
}

function labelMotif(m: string) {
  const MAP: Record<string, string> = {
    VENTE: "Vente",
    TRANSFORMATION: "Transformation",
    USAGE_INTERNE: "Usage interne",
    REMPLACEMENT_DEFECTUEUX: "Remplacement",
    AUTRE: "Autre",
  };
  return MAP[m] ?? m;
}
function labelStatut(s: string) {
  const MAP: Record<string, string> = {
    EN_ATTENTE: "En attente",
    CONFIRMEE: "Confirmée",
    REFUSEE: "Refusée",
    ESCALADE_PATRONNE: "Escaladée",
    OUVERTE: "Ouverte",
    EN_COURS: "En cours",
    RESOLUE: "Résolue",
    CLASSEE: "Classée",
  };
  return MAP[s] ?? s;
}

interface ColDef {
  header: string;
  width: number;
}

function drawTableau(
  doc: PDFKit.PDFDocument,
  cols: ColDef[],
  rows: string[][],
  startX: number,
  startY: number
): number {
  const ROW_H = 16;
  const HEAD_H = 18;
  const totalW = cols.reduce((s, c) => s + c.width, 0);
  let y = startY;

  // En-tête
  doc.save();
  doc.fillColor(VERT).rect(startX, y, totalW, HEAD_H).fill();
  doc.fillColor("white").font("Helvetica-Bold").fontSize(7.5);
  let cx = startX;
  for (const col of cols) {
    doc.text(col.header, cx + 3, y + 5, { width: col.width - 6, lineBreak: false });
    cx += col.width;
  }
  doc.restore();
  y += HEAD_H;

  // Lignes
  doc.font("Helvetica").fontSize(7).fillColor(TEXTE);
  rows.forEach((row, ri) => {
    if (ri % 2 === 0) {
      doc.save().fillColor(GRIS_LIGNE).rect(startX, y, totalW, ROW_H).fill().restore();
    }
    doc.fillColor(TEXTE);
    cx = startX;
    for (let i = 0; i < cols.length; i++) {
      const val = row[i] ?? "";
      doc.text(val, cx + 3, y + 4, { width: cols[i].width - 6, lineBreak: false });
      cx += cols[i].width;
    }
    // Bordure basse
    doc.save()
      .strokeColor("#dddddd")
      .lineWidth(0.4)
      .moveTo(startX, y + ROW_H)
      .lineTo(startX + totalW, y + ROW_H)
      .stroke()
      .restore();
    y += ROW_H;
  });

  // Bordure extérieure
  doc.save()
    .strokeColor("#aaaaaa")
    .lineWidth(0.8)
    .rect(startX, startY, totalW, HEAD_H + ROW_H * rows.length)
    .stroke()
    .restore();

  return y;
}

function sectionTitre(doc: PDFKit.PDFDocument, titre: string, y: number): number {
  doc.save()
    .fillColor(VERT_FONCE)
    .rect(MARGE, y, CONTENU_W, 20)
    .fill()
    .fillColor("white")
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(titre, MARGE + 8, y + 5)
    .restore();
  return y + 28;
}

function sousTitre(doc: PDFKit.PDFDocument, texte: string, y: number): number {
  doc.font("Helvetica-Bold").fontSize(9).fillColor(VERT).text(texte, MARGE, y);
  return y + 14;
}

function vide(doc: PDFKit.PDFDocument, n: number, y: number): number {
  return y + n;
}

function verifSaut(doc: PDFKit.PDFDocument, y: number, besoin: number): number {
  if (y + besoin > MAX_Y) {
    doc.addPage();
    return MARGE;
  }
  return y;
}

export async function genererPdfRapport(dateDebut: Date, dateFin: Date): Promise<Buffer> {
  const [receptions, sorties, pointages, alertes] = await Promise.all([
    prisma.reception.findMany({
      where: { createdAt: { gte: dateDebut, lte: dateFin } },
      include: { produit: true, gerant: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.sortie.findMany({
      where: { annonceAt: { gte: dateDebut, lte: dateFin } },
      include: { produit: true, employe: true, gerant: true },
      orderBy: { annonceAt: "desc" },
    }),
    prisma.pointage.findMany({
      where: { entreeAt: { gte: dateDebut, lte: dateFin } },
      include: { employe: true, gerant: true },
      orderBy: { entreeAt: "desc" },
    }),
    prisma.alerte.findMany({
      where: { createdAt: { gte: dateDebut, lte: dateFin } },
      include: { produit: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const doc = new PDFDocument({ margin: MARGE, size: "A4", autoFirstPage: true });
  const chunks: Buffer[] = [];
  doc.on("data", (c) => chunks.push(c));

  const buffer = await new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    let y = MARGE;

    // ── EN-TÊTE ──────────────────────────────────────────────────────────────
    doc.save()
      .fillColor(VERT_FONCE)
      .rect(MARGE, y, CONTENU_W, 60)
      .fill()
      .restore();

    doc.fillColor("white")
      .font("Helvetica-Bold")
      .fontSize(18)
      .text("RAPPORT D'ACTIVITÉ", MARGE, y + 10, { width: CONTENU_W, align: "center" });

    const periodeTxt = `Période : ${fmtDate(dateDebut)}  →  ${fmtDate(dateFin)}`;
    doc.font("Helvetica").fontSize(10)
      .text(periodeTxt, MARGE, y + 34, { width: CONTENU_W, align: "center" });

    y += 70;

    doc.font("Helvetica").fontSize(8).fillColor("#555555")
      .text(`Généré le ${fmt(new Date())}`, MARGE, y, { align: "right", width: CONTENU_W });
    y += 20;

    // ── SECTION 1 : MOUVEMENTS DE STOCK ─────────────────────────────────────
    y = verifSaut(doc, y, 60);
    y = sectionTitre(doc, "1.  MOUVEMENTS DE STOCK", y);

    // Réceptions
    y = verifSaut(doc, y, 40);
    y = sousTitre(doc, `A. Réceptions  (${receptions.length})`, y);

    if (receptions.length === 0) {
      doc.font("Helvetica").fontSize(8).fillColor("#888").text("Aucune réception sur la période.", MARGE, y);
      y += 18;
    } else {
      const colsRec: ColDef[] = [
        { header: "Produit", width: 120 },
        { header: "Méthode", width: 90 },
        { header: "Qté attendue", width: 75 },
        { header: "Qté estimée", width: 75 },
        { header: "Écart %", width: 65 },
        { header: "Gérant", width: 90 },
      ];
      const rowsRec = receptions.map((r) => [
        r.produit.nom,
        r.methode === "PESEE_ASSISTEE" ? "Pesée assistée" : "Comptage groupé",
        String(r.quantiteAttendue),
        String(r.quantiteEstimee),
        `${r.ecartPct.toFixed(1)} %`,
        `${r.gerant.prenom} ${r.gerant.nom}`,
      ]);
      y = verifSaut(doc, y, 18 + receptions.length * 16 + 10);
      y = drawTableau(doc, colsRec, rowsRec, MARGE, y);
    }

    y = vide(doc, 14, y);

    // Sorties
    y = verifSaut(doc, y, 40);
    y = sousTitre(doc, `B. Sorties  (${sorties.length})`, y);

    if (sorties.length === 0) {
      doc.font("Helvetica").fontSize(8).fillColor("#888").text("Aucune sortie sur la période.", MARGE, y);
      y += 18;
    } else {
      const colsSor: ColDef[] = [
        { header: "Produit", width: 100 },
        { header: "Employé", width: 95 },
        { header: "Motif", width: 85 },
        { header: "Qté annoncée", width: 75 },
        { header: "Qté confirmée", width: 75 },
        { header: "Statut", width: 85 },
      ];
      const rowsSor = sorties.map((s) => [
        s.produit.nom,
        `${s.employe.prenom} ${s.employe.nom}`,
        labelMotif(s.motif),
        String(s.quantiteAnnoncee),
        s.quantiteConfirmee != null ? String(s.quantiteConfirmee) : "—",
        labelStatut(s.statut),
      ]);
      y = verifSaut(doc, y, 18 + sorties.length * 16 + 10);
      y = drawTableau(doc, colsSor, rowsSor, MARGE, y);
    }

    y = vide(doc, 20, y);

    // ── SECTION 2 : POINTAGE ─────────────────────────────────────────────────
    y = verifSaut(doc, y, 60);
    y = sectionTitre(doc, "2.  POINTAGE DES EMPLOYÉS", y);
    y = sousTitre(doc, `Présences enregistrées  (${pointages.length})`, y);

    if (pointages.length === 0) {
      doc.font("Helvetica").fontSize(8).fillColor("#888").text("Aucun pointage sur la période.", MARGE, y);
      y += 18;
    } else {
      const colsPt: ColDef[] = [
        { header: "Employé", width: 135 },
        { header: "Heure d'entrée", width: 95 },
        { header: "Heure de sortie", width: 95 },
        { header: "Durée", width: 80 },
        { header: "Gérant responsable", width: 110 },
      ];
      const rowsPt = pointages.map((p) => [
        `${p.employe.prenom} ${p.employe.nom}`,
        fmtHeure(p.entreeAt),
        p.sortieAt ? fmtHeure(p.sortieAt) : "—",
        duree(p.entreeAt, p.sortieAt),
        `${p.gerant.prenom} ${p.gerant.nom}`,
      ]);
      y = verifSaut(doc, y, 18 + pointages.length * 16 + 10);
      y = drawTableau(doc, colsPt, rowsPt, MARGE, y);
    }

    y = vide(doc, 20, y);

    // ── SECTION 3 : ALERTES ──────────────────────────────────────────────────
    y = verifSaut(doc, y, 60);
    y = sectionTitre(doc, "3.  ALERTES ET ÉCARTS DE STOCK", y);
    y = sousTitre(doc, `Alertes détectées  (${alertes.length})`, y);

    if (alertes.length === 0) {
      doc.font("Helvetica").fontSize(8).fillColor("#888").text("Aucune alerte sur la période.", MARGE, y);
      y += 18;
    } else {
      const colsAl: ColDef[] = [
        { header: "Produit", width: 120 },
        { header: "Écart (unités)", width: 80 },
        { header: "Statut", width: 80 },
        { header: "Gérant en poste", width: 120 },
        { header: "Détectée le", width: 115 },
      ];
      const rowsAl = alertes.map((a) => [
        a.produit?.nom ?? "N/A",
        String(a.ecartQuantite),
        labelStatut(a.statut),
        a.gerantEnPoste,
        fmt(a.createdAt),
      ]);
      y = verifSaut(doc, y, 18 + alertes.length * 16 + 10);
      y = drawTableau(doc, colsAl, rowsAl, MARGE, y);
    }

    y = vide(doc, 24, y);

    // ── RÉSUMÉ ───────────────────────────────────────────────────────────────
    y = verifSaut(doc, y, 120);
    doc.save()
      .strokeColor(VERT)
      .lineWidth(1)
      .rect(MARGE, y, CONTENU_W, 100)
      .stroke()
      .restore();

    doc.font("Helvetica-Bold").fontSize(10).fillColor(VERT_FONCE)
      .text("RÉSUMÉ", MARGE + 10, y + 10);
    y += 28;

    const sortiesConf = sorties.filter((s) => s.statut === "CONFIRMEE").length;
    const sortiesAtt = sorties.filter((s) => s.statut === "EN_ATTENTE").length;
    const alertesOuv = alertes.filter((a) => a.statut === "OUVERTE" || a.statut === "EN_COURS").length;
    const empPresents = new Set(pointages.map((p) => p.employeId)).size;

    const lignesResume = [
      [`Réceptions enregistrées`, String(receptions.length)],
      [`Sorties confirmées / en attente`, `${sortiesConf} / ${sortiesAtt}`],
      [`Employés présents`, String(empPresents)],
      [`Alertes actives (ouvertes + en cours)`, String(alertesOuv)],
    ];

    doc.font("Helvetica").fontSize(9).fillColor(TEXTE);
    for (const [label, val] of lignesResume) {
      doc.text(label, MARGE + 12, y);
      doc.font("Helvetica-Bold").text(val, MARGE + CONTENU_W - 60, y - doc.currentLineHeight(), {
        width: 50,
        align: "right",
      });
      doc.font("Helvetica");
      y += 14;
    }

    // ── PIED DE PAGE ─────────────────────────────────────────────────────────
    const totalPages = doc.bufferedPageRange().count || 1;
    doc.font("Helvetica").fontSize(7).fillColor("#aaaaaa")
      .text(
        `Rapport généré automatiquement — Confidentiel`,
        MARGE,
        PAGE_H - 30,
        { width: CONTENU_W, align: "center" }
      );

    doc.end();
    void totalPages;
  });

  return buffer;
}
