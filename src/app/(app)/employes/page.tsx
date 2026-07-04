"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import {
  Plus, Users, Phone, Search, UserCheck,
  Scissors, Truck, ShoppingBag, DollarSign, Shield, UserCircle,
} from "lucide-react";

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.FC<{ className?: string }> }> = {
  COIFFEUSE:  { label: "Coiffeuse",  color: "text-pink-600",   bg: "bg-pink-50 border-pink-200",    icon: Scissors },
  COIFFEUR:   { label: "Coiffeur",   color: "text-pink-600",   bg: "bg-pink-50 border-pink-200",    icon: Scissors },
  LIVREUR:    { label: "Livreur",    color: "text-blue-600",   bg: "bg-blue-50 border-blue-200",    icon: Truck },
  LIVREUSE:   { label: "Livreuse",   color: "text-blue-600",   bg: "bg-blue-50 border-blue-200",    icon: Truck },
  VENDEUR:    { label: "Vendeur",    color: "text-green-600",  bg: "bg-green-50 border-green-200",  icon: ShoppingBag },
  VENDEUSE:   { label: "Vendeuse",   color: "text-green-600",  bg: "bg-green-50 border-green-200",  icon: ShoppingBag },
  CAISSIER:   { label: "Caissier",   color: "text-amber-600",  bg: "bg-amber-50 border-amber-200",  icon: DollarSign },
  CAISSIERE:  { label: "Caissière",  color: "text-amber-600",  bg: "bg-amber-50 border-amber-200",  icon: DollarSign },
  SECURITE:   { label: "Sécurité",   color: "text-red-600",    bg: "bg-red-50 border-red-200",      icon: Shield },
  AUTRE:      { label: "Autre",      color: "text-gray-600",   bg: "bg-gray-50 border-gray-200",    icon: UserCircle },
};

type Employe = {
  id: string;
  nom: string;
  prenom: string;
  role: string;
  telephone: string | null;
  actif: boolean;
  createdAt: string;
};

function RoleBadge({ role }: { role: string }) {
  const cfg = ROLE_CONFIG[role] ?? ROLE_CONFIG.AUTRE;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.color}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function initiales(nom: string, prenom: string) {
  return `${prenom[0] ?? ""}${nom[0] ?? ""}`.toUpperCase();
}

const AVATAR_COLORS = [
  "from-primary to-primary-light",
  "from-accent to-accent-light",
  "from-success to-emerald-500",
  "from-info to-purple-500",
  "from-warning to-amber-400",
  "from-danger to-rose-400",
];

export default function EmployesPage() {
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [search, setSearch] = useState("");
  const [filtre, setFiltre] = useState("TOUS");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/employes")
      .then((r) => r.json())
      .then((data) => { setEmployes(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const roles = ["TOUS", ...Array.from(new Set(employes.map((e) => e.role)))];

  const filtered = employes.filter((e) => {
    const match = `${e.prenom} ${e.nom}`.toLowerCase().includes(search.toLowerCase());
    const roleMatch = filtre === "TOUS" || e.role === filtre;
    return match && roleMatch;
  });

  const actifs = employes.filter((e) => e.actif).length;

  return (
    <>
      <Header title="Employés" subtitle="Gestion de l'équipe et des rôles" />
      <div className="flex-1 space-y-6 p-4 sm:p-6">

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-main">{employes.length}</p>
                <p className="text-sm text-text-muted">Total employés</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <UserCheck className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-main">{actifs}</p>
                <p className="text-sm text-text-muted">Actifs</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-main">
                  {employes.filter((e) => e.role === "LIVREUR" || e.role === "LIVREUSE").length}
                </p>
                <p className="text-sm text-text-muted">Livreurs</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres + recherche */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Rechercher un employé…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-card pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => setFiltre(r)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  filtre === r
                    ? "bg-primary text-white border-primary"
                    : "bg-card text-text-muted border-border hover:border-primary hover:text-primary"
                }`}
              >
                {r === "TOUS" ? "Tous" : (ROLE_CONFIG[r]?.label ?? r)}
              </button>
            ))}
          </div>
          <Link href="/employes/nouveau">
            <Button variant="accent" className="shrink-0">
              <Plus className="h-4 w-4" />Nouvel employé
            </Button>
          </Link>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-text-muted">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-text-muted">
            <Users className="h-12 w-12 opacity-30" />
            <p className="text-sm">Aucun employé trouvé</p>
            <Link href="/employes/nouveau">
              <Button variant="accent" size="sm"><Plus className="h-4 w-4" />Ajouter un employé</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((emp, idx) => {
              const grad = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              return (
                <Card
                  key={emp.id}
                  className={`card-hover overflow-hidden transition-opacity ${!emp.actif ? "opacity-60" : ""}`}
                >
                  <CardContent className="p-0">
                    <div className="flex items-center gap-4 p-5">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${grad} text-base font-bold text-white shadow-md ${!emp.actif ? "grayscale" : ""}`}>
                        {initiales(emp.nom, emp.prenom)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-text-main truncate">
                          {emp.prenom} {emp.nom}
                        </p>
                        <div className="mt-1">
                          <RoleBadge role={emp.role} />
                        </div>
                      </div>
                    </div>

                    {emp.telephone && (
                      <div className="border-t border-border px-5 py-3">
                        <a href={`tel:${emp.telephone}`} className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors">
                          <Phone className="h-3.5 w-3.5" />
                          {emp.telephone}
                        </a>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-border px-5 py-3">
                      <span className="text-xs text-text-muted">Employé {emp.actif ? "actif" : "inactif"}</span>
                      <Switch
                        checked={emp.actif}
                        onChange={async (actif) => {
                          setEmployes((prev) => prev.map((e) => e.id === emp.id ? { ...e, actif } : e));
                          await fetch(`/api/employes/${emp.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ actif }),
                          });
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
