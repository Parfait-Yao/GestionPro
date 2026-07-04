"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  FileText,
  Send,
  CheckCircle,
  AlertCircle,
  Loader,
  CalendarRange,
  ArrowRight,
  PackageSearch,
  ArrowUpFromLine,
  Clock,
  TriangleAlert,
  BarChart3,
  Download,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, startOfDay, endOfDay, startOfMonth } from "date-fns";
import { fr } from "date-fns/locale";

type Statut = "idle" | "loading" | "ok" | "erreur";

const CONTENU_RAPPORT = [
  {
    icon: PackageSearch,
    accent: "kpi-primary",
    texte: "Toutes les réceptions de stock (méthode, quantité, écart %)",
  },
  {
    icon: ArrowUpFromLine,
    accent: "kpi-accent",
    texte: "Toutes les sorties (employé, motif, statut de confirmation)",
  },
  {
    icon: Clock,
    accent: "kpi-info",
    texte: "Pointage des employés (entrée, sortie, durée)",
  },
  {
    icon: TriangleAlert,
    accent: "kpi-danger",
    texte: "Alertes et écarts de stock détectés",
  },
  {
    icon: BarChart3,
    accent: "kpi-success",
    texte: "Résumé chiffré de l'activité",
  },
];

export default function RapportsPage() {
  const today = format(new Date(), "yyyy-MM-dd");
  const debutMois = format(startOfMonth(new Date()), "yyyy-MM-dd");

  const [dateDebut, setDateDebut] = useState(debutMois);
  const [dateFin, setDateFin] = useState(today);
  const [statutWA, setStatutWA] = useState<Statut>("idle");
  const [messageWA, setMessageWA] = useState("");

  function buildParams() {
    const debut = startOfDay(new Date(dateDebut)).toISOString();
    const fin = endOfDay(new Date(dateFin)).toISOString();
    return { debut, fin };
  }

  function telechargerPdf() {
    const { debut, fin } = buildParams();
    const url = `/api/rapports/pdf?dateDebut=${encodeURIComponent(debut)}&dateFin=${encodeURIComponent(fin)}`;
    window.open(url, "_blank");
  }

  async function envoyerWhatsApp() {
    setStatutWA("loading");
    setMessageWA("");
    const { debut, fin } = buildParams();

    try {
      const res = await fetch("/api/rapports/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateDebut: debut, dateFin: fin }),
      });
      const json = await res.json() as { ok?: boolean; error?: string; destinataire?: string };

      if (!res.ok) {
        setStatutWA("erreur");
        setMessageWA(json.error ?? "Erreur inconnue");
      } else {
        setStatutWA("ok");
        setMessageWA(`Rapport envoyé sur ${json.destinataire}`);
      }
    } catch {
      setStatutWA("erreur");
      setMessageWA("Impossible de contacter le serveur.");
    }
  }

  const periodes = [
    { label: "Aujourd'hui", debut: today, fin: today },
    {
      label: "7 derniers jours",
      debut: format(new Date(Date.now() - 6 * 86400000), "yyyy-MM-dd"),
      fin: today,
    },
    { label: "Ce mois", debut: debutMois, fin: today },
  ];

  const nbJours =
    Math.round(
      (new Date(dateFin).getTime() - new Date(dateDebut).getTime()) / 86400000
    ) + 1;

  return (
    <>
      <Header
        title="Rapports"
        subtitle="Générez et envoyez des rapports d'activité à la patronne"
      />

      <div className="flex-1 space-y-6 p-4 sm:p-6">
        {/* Bandeau d'intro */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-6 text-white shadow-lg shadow-primary/20 sm:p-7">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-16 right-24 h-32 w-32 rounded-full bg-white/5" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">Rapport d&apos;activité</p>
              <p className="mt-0.5 text-sm text-white/80">
                Compilez les mouvements, pointages et alertes sur la période choisie.
              </p>
            </div>
          </div>
        </div>

        {/* Sélection de la période */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg kpi-primary">
                <CalendarRange className="h-4 w-4" />
              </div>
              Période du rapport
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Raccourcis */}
            <div className="flex flex-wrap gap-2">
              {periodes.map((p) => {
                const actif = dateDebut === p.debut && dateFin === p.fin;
                return (
                  <button
                    key={p.label}
                    onClick={() => {
                      setDateDebut(p.debut);
                      setDateFin(p.fin);
                    }}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all",
                      actif
                        ? "border-transparent bg-gradient-to-r from-primary to-primary-light text-white shadow-sm shadow-primary/25"
                        : "border-border text-text-muted hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                    )}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Saisie manuelle */}
            <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
              <Input
                label="Date de début"
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                max={dateFin}
              />
              <div className="hidden h-11 items-center justify-center text-text-muted sm:flex">
                <ArrowRight className="h-4 w-4" />
              </div>
              <Input
                label="Date de fin"
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                min={dateDebut}
                max={today}
              />
            </div>

            {/* Résumé de la période */}
            <div className="flex items-center gap-2 rounded-lg bg-surface px-3.5 py-2.5 text-xs font-medium text-text-muted">
              <CalendarRange className="h-3.5 w-3.5 shrink-0" />
              Période sélectionnée : {format(new Date(dateDebut), "d MMMM yyyy", { locale: fr })}
              {" → "}
              {format(new Date(dateFin), "d MMMM yyyy", { locale: fr })}
              {" · "}
              {nbJours > 0 ? `${nbJours} jour${nbJours > 1 ? "s" : ""}` : "—"}
            </div>
          </CardContent>
        </Card>

        {/* Contenu du rapport */}
        <Card>
          <CardHeader>
            <CardTitle>Contenu inclus dans le rapport</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {CONTENU_RAPPORT.map(({ icon: Icon, accent, texte }) => (
                <li
                  key={texte}
                  className="flex items-start gap-3 rounded-xl border border-border bg-surface/60 p-3"
                >
                  <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", accent)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="mt-1 text-sm text-text-main">{texte}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Télécharger PDF */}
          <Card className="card-hover border-primary/15">
            <CardContent className="flex flex-col items-center gap-4 pt-7 pb-7">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl kpi-primary">
                <FileText className="h-7 w-7" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-text-main">Télécharger le PDF</p>
                <p className="mt-1 text-sm text-text-muted">
                  Enregistre le rapport sur votre appareil
                </p>
              </div>
              <Button className="w-full" onClick={telechargerPdf}>
                <Download className="h-4 w-4" />
                Télécharger PDF
              </Button>
            </CardContent>
          </Card>

          {/* Envoyer WhatsApp */}
          <Card className="card-hover border-success/15">
            <CardContent className="flex flex-col items-center gap-4 pt-7 pb-7">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl kpi-success">
                <Send className="h-7 w-7" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-text-main">Envoyer sur WhatsApp</p>
                <p className="mt-1 text-sm text-text-muted">
                  Envoie le rapport en PDF directement à la patronne
                </p>
              </div>
              <Button
                className="w-full"
                variant="success"
                onClick={envoyerWhatsApp}
                disabled={statutWA === "loading"}
              >
                {statutWA === "loading" ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Envoi en cours…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Envoyer sur WhatsApp
                  </>
                )}
              </Button>

              {/* Retour d'état */}
              {statutWA === "ok" && (
                <div className="flex w-full items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm font-medium text-success">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  {messageWA}
                </div>
              )}
              {statutWA === "erreur" && (
                <div className="flex w-full items-start gap-2 rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{messageWA}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info configuration WhatsApp */}
        <Card className="border-warning/20 bg-warning/5">
          <CardContent className="flex items-start gap-3 pt-4 pb-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg kpi-warning">
              <ShieldAlert className="h-[18px] w-[18px]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-warning">Configuration requise pour l&apos;envoi WhatsApp</p>
              <p className="mt-1 text-sm text-text-muted">
                Pour envoyer des rapports via WhatsApp, renseignez{" "}
                <code className="rounded bg-warning/15 px-1 font-mono text-xs text-warning">WHATSAPP_TOKEN</code> et{" "}
                <code className="rounded bg-warning/15 px-1 font-mono text-xs text-warning">WHATSAPP_PHONE_NUMBER_ID</code>{" "}
                dans le fichier <code className="rounded bg-warning/15 px-1 font-mono text-xs text-warning">.env.local</code>,
                puis configurez le numéro de la patronne dans{" "}
                <a href="/parametres" className="font-semibold underline">Paramètres</a>.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
