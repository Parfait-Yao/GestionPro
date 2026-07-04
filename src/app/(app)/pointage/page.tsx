"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PointageCard } from "@/components/pointage/PointageCard";
import { JournalPointage } from "@/components/pointage/JournalPointage";
import { Users, UserCheck, LogOut, Search } from "lucide-react";
import { toast } from "sonner";

const ROLE_LABELS: Record<string, string> = {
  COIFFEUSE: "Coiffeuse",
  COIFFEUR: "Coiffeur",
  LIVREUR: "Livreur",
  LIVREUSE: "Livreuse",
  VENDEUR: "Vendeur",
  VENDEUSE: "Vendeuse",
  CAISSIER: "Caissier",
  CAISSIERE: "Caissière",
  SECURITE: "Sécurité",
  AUTRE: "Employé",
};

type Employe = { id: string; nom: string; prenom: string; role: string; actif: boolean };
type Pointage = {
  id: string;
  employeId: string;
  entreeAt: string;
  sortieAt: string | null;
  employe: { id: string; nom: string; prenom: string; role: string };
};

function todayStr() {
  return format(new Date(), "yyyy-MM-dd");
}

export default function PointagePage() {
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [openPointages, setOpenPointages] = useState<Pointage[]>([]);
  const [journal, setJournal] = useState<Pointage[]>([]);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadEmployesEtPresences = useCallback(async () => {
    const [empRes, openRes] = await Promise.all([
      fetch("/api/employes"),
      fetch("/api/pointage?open=true"),
    ]);
    setEmployes(await empRes.json());
    setOpenPointages(await openRes.json());
  }, []);

  const loadJournal = useCallback(async (date: string) => {
    const res = await fetch(`/api/pointage?date=${date}`);
    setJournal(await res.json());
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/employes").then((r) => r.json()),
      fetch("/api/pointage?open=true").then((r) => r.json()),
    ]).then(([emp, open]) => {
      setEmployes(emp);
      setOpenPointages(open);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetch(`/api/pointage?date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => setJournal(data));
  }, [selectedDate]);

  const presenceByEmploye = useMemo(() => {
    const map = new Map<string, Pointage>();
    for (const p of openPointages) map.set(p.employeId, p);
    return map;
  }, [openPointages]);

  const actifs = employes.filter((e) => e.actif);
  const filtered = actifs.filter((e) => `${e.prenom} ${e.nom}`.toLowerCase().includes(search.toLowerCase()));

  async function refreshAfterAction() {
    await loadEmployesEtPresences();
    if (selectedDate === todayStr()) await loadJournal(selectedDate);
  }

  async function handleEntree(employeId: string, nomComplet: string) {
    setBusyId(employeId);
    try {
      const res = await fetch("/api/pointage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeId }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        toast.error(error ?? "Erreur lors du pointage");
        return;
      }
      toast.success(`Entrée enregistrée pour ${nomComplet}`);
      await refreshAfterAction();
    } finally {
      setBusyId(null);
    }
  }

  async function handleSortie(pointageId: string, employeId: string, nomComplet: string) {
    setBusyId(employeId);
    try {
      const res = await fetch(`/api/pointage/${pointageId}`, { method: "PATCH" });
      if (!res.ok) {
        const { error } = await res.json();
        toast.error(error ?? "Erreur lors de la sortie");
        return;
      }
      toast.success(`Sortie enregistrée pour ${nomComplet}`);
      await refreshAfterAction();
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(pointageId: string) {
    const res = await fetch(`/api/pointage/${pointageId}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Erreur lors de la suppression");
      return;
    }
    toast.success("Pointage supprimé du journal");
    await loadJournal(selectedDate);
    await loadEmployesEtPresences();
  }

  return (
    <>
      <Header title="Pointage entrepôt" subtitle="Suivi des entrées et sorties de l'équipe, en temps réel" />
      <div className="flex-1 space-y-6 p-4 sm:p-6">

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"><Users className="h-6 w-6 text-primary" /></div>
              <div><p className="text-2xl font-bold text-text-main">{actifs.length}</p><p className="text-sm text-text-muted">Employés actifs</p></div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50"><UserCheck className="h-6 w-6 text-emerald-600" /></div>
              <div><p className="text-2xl font-bold text-text-main">{openPointages.length}</p><p className="text-sm text-text-muted">En entrepôt maintenant</p></div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50"><LogOut className="h-6 w-6 text-amber-600" /></div>
              <div>
                <p className="text-2xl font-bold text-text-main">{journal.filter((p) => p.sortieAt).length}</p>
                <p className="text-sm text-text-muted">Sorties {selectedDate === todayStr() ? "aujourd'hui" : "ce jour-là"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recherche */}
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

        {/* Cartes employés */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-text-muted">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-text-muted">
            <Users className="h-12 w-12 opacity-30" />
            <p className="text-sm">Aucun employé trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((emp, idx) => {
              const pointage = presenceByEmploye.get(emp.id);
              const present = !!pointage;
              return (
                <PointageCard
                  key={emp.id}
                  nom={emp.nom}
                  prenom={emp.prenom}
                  roleLabel={ROLE_LABELS[emp.role] ?? emp.role}
                  gradIndex={idx}
                  present={present}
                  entreeAt={pointage ? format(new Date(pointage.entreeAt), "HH:mm") : null}
                  loading={busyId === emp.id}
                  onEntree={() => handleEntree(emp.id, `${emp.prenom} ${emp.nom}`)}
                  onSortie={() => pointage && handleSortie(pointage.id, emp.id, `${emp.prenom} ${emp.nom}`)}
                />
              );
            })}
          </div>
        )}

        {/* Journal du jour */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Journal des pointages</CardTitle>
            <input
              type="date"
              max={todayStr()}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </CardHeader>
          <CardContent>
            <JournalPointage
              entries={journal.map((p) => ({
                id: p.id,
                nom: p.employe.nom,
                prenom: p.employe.prenom,
                entreeAt: p.entreeAt,
                sortieAt: p.sortieAt,
              }))}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
