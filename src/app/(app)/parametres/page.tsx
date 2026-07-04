"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Shield, MessageCircle, KeyRound, CheckCircle, AlertCircle, Loader, SlidersHorizontal } from "lucide-react";

type StatutSave = "idle" | "loading" | "ok" | "erreur";

export default function ParametresPage() {
  const [numero, setNumero] = useState("");
  const [heureAuto, setHeureAuto] = useState("18:00");
  const [autoActif, setAutoActif] = useState(false);
  const [statut, setStatut] = useState<StatutSave>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/parametres/config")
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        setNumero(data.whatsapp_numero_patronne ?? "");
        setHeureAuto(data.rapport_heure_auto ?? "18:00");
        setAutoActif(data.rapport_auto_actif === "true");
      })
      .catch(() => {});
  }, []);

  async function enregistrer() {
    setStatut("loading");
    setMessage("");
    try {
      const res = await fetch("/api/parametres/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsapp_numero_patronne: numero,
          rapport_heure_auto: heureAuto,
          rapport_auto_actif: String(autoActif),
        }),
      });
      if (res.ok) {
        setStatut("ok");
        setMessage("Paramètres enregistrés avec succès.");
      } else {
        setStatut("erreur");
        setMessage("Erreur lors de l'enregistrement.");
      }
    } catch {
      setStatut("erreur");
      setMessage("Impossible de contacter le serveur.");
    }
  }

  return (
    <>
      <Header title="Paramètres" subtitle="Compte gérant, notifications et seuils" />
      <div className="flex-1 space-y-6 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Gérant */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-primary" />
                Compte Gérant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 p-4 border border-primary/20">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-light text-lg font-bold text-white shadow-lg shadow-primary/30">
                  BS
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold text-text-main">Brou Steven</p>
                  <p className="text-sm text-text-muted">Gérant — compte actif</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="inline-flex h-2 w-2 rounded-full bg-success" />
                    <span className="text-xs text-success font-medium">En ligne</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="shrink-0">
                  <KeyRound className="h-4 w-4" />
                  Changer PIN
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications WhatsApp */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageCircle className="h-4 w-4 text-success" />
                Notifications WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Numéro WhatsApp"
                placeholder="+225 07 00 00 00 00"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-main">
                  Heure d&apos;envoi automatique
                </label>
                <input
                  type="time"
                  value={heureAuto}
                  onChange={(e) => setHeureAuto(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={autoActif}
                    onChange={(e) => setAutoActif(e.target.checked)}
                  />
                  <div className={`h-6 w-11 rounded-full transition-colors ${autoActif ? "bg-primary" : "bg-border"}`} />
                  <div className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${autoActif ? "translate-x-5" : "translate-x-0"}`} />
                </div>
                <span className="text-sm text-text-muted">Envoi automatique quotidien</span>
              </label>

              <Button variant="primary" className="w-full" onClick={enregistrer} disabled={statut === "loading"}>
                {statut === "loading" ? (
                  <><Loader className="h-4 w-4 animate-spin" />Enregistrement…</>
                ) : "Enregistrer les paramètres"}
              </Button>

              {statut === "ok" && (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                  <CheckCircle className="h-4 w-4" />{message}
                </div>
              )}
              {statut === "erreur" && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4" />{message}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Seuils globaux */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <SlidersHorizontal className="h-4 w-4 text-warning" />
              Seuils globaux par défaut
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Tolérance pesée par défaut (%)" type="number" defaultValue={3} />
            <Input label="Seuil d'escalade (unités)" type="number" defaultValue={50} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
