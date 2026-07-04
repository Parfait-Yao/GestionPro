"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { UserPlus, Scissors, Truck, ShoppingBag, DollarSign, Shield, UserCircle, Loader, CheckCircle } from "lucide-react";

const ROLES = [
  { value: "COIFFEUSE",  label: "Coiffeuse",  icon: Scissors,    color: "text-pink-600  bg-pink-50  border-pink-300"  },
  { value: "COIFFEUR",   label: "Coiffeur",   icon: Scissors,    color: "text-pink-600  bg-pink-50  border-pink-300"  },
  { value: "LIVREUR",    label: "Livreur",    icon: Truck,       color: "text-blue-600  bg-blue-50  border-blue-300"  },
  { value: "LIVREUSE",   label: "Livreuse",   icon: Truck,       color: "text-blue-600  bg-blue-50  border-blue-300"  },
  { value: "VENDEUR",    label: "Vendeur",    icon: ShoppingBag, color: "text-green-600 bg-green-50 border-green-300" },
  { value: "VENDEUSE",   label: "Vendeuse",   icon: ShoppingBag, color: "text-green-600 bg-green-50 border-green-300" },
  { value: "CAISSIER",   label: "Caissier",   icon: DollarSign,  color: "text-amber-600 bg-amber-50 border-amber-300" },
  { value: "CAISSIERE",  label: "Caissière",  icon: DollarSign,  color: "text-amber-600 bg-amber-50 border-amber-300" },
  { value: "SECURITE",   label: "Sécurité",   icon: Shield,      color: "text-red-600   bg-red-50   border-red-300"   },
  { value: "AUTRE",      label: "Autre",      icon: UserCircle,  color: "text-gray-600  bg-gray-50  border-gray-300"  },
];

export default function NouvelEmployePage() {
  const router = useRouter();
  const [form, setForm] = useState({ nom: "", prenom: "", telephone: "", role: "AUTRE" });
  const [statut, setStatut] = useState<"idle" | "loading" | "ok" | "erreur">("idle");
  const [errMsg, setErrMsg] = useState("");

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nom.trim() || !form.prenom.trim()) {
      setErrMsg("Veuillez remplir le nom et le prénom.");
      return;
    }
    setStatut("loading");
    setErrMsg("");
    try {
      const res = await fetch("/api/employes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatut("ok");
        setTimeout(() => router.push("/employes"), 1200);
      } else {
        const data = await res.json();
        setErrMsg(data.error ?? "Erreur lors de la création.");
        setStatut("erreur");
      }
    } catch {
      setErrMsg("Impossible de contacter le serveur.");
      setStatut("erreur");
    }
  }

  return (
    <>
      <Header title="Nouvel employé" subtitle="Ajouter un membre de l'équipe" />
      <div className="flex-1 p-4 sm:p-6">
        <div className="mx-auto max-w-2xl">
          <form onSubmit={submit} className="space-y-6">

            {/* Infos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserPlus className="h-4 w-4 text-primary" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Prénom *"
                    placeholder="ex: Aminata"
                    value={form.prenom}
                    onChange={(e) => set("prenom", e.target.value)}
                    required
                  />
                  <Input
                    label="Nom *"
                    placeholder="ex: KONÉ"
                    value={form.nom}
                    onChange={(e) => set("nom", e.target.value)}
                    required
                  />
                </div>
                <Input
                  label="Téléphone (optionnel)"
                  type="tel"
                  placeholder="+225 07 00 00 00 00"
                  value={form.telephone}
                  onChange={(e) => set("telephone", e.target.value)}
                />
              </CardContent>
            </Card>

            {/* Rôle */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Rôle / Poste</CardTitle>
                <p className="text-sm text-text-muted">Sélectionnez la fonction de cet employé</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {ROLES.map((r) => {
                    const Icon = r.icon;
                    const selected = form.role === r.value;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => set("role", r.value)}
                        className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-all ${
                          selected
                            ? `border-primary bg-primary/10 text-primary shadow-md`
                            : `border-border bg-card text-text-muted hover:border-primary/40 hover:text-primary`
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {errMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
                {errMsg}
              </div>
            )}

            {statut === "ok" && (
              <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-200">
                <CheckCircle className="h-4 w-4" />
                Employé créé avec succès ! Redirection…
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Annuler
              </Button>
              <Button type="submit" variant="accent" disabled={statut === "loading" || statut === "ok"}>
                {statut === "loading" ? (
                  <><Loader className="h-4 w-4 animate-spin" />Création…</>
                ) : (
                  <><UserPlus className="h-4 w-4" />Créer l&apos;employé</>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
