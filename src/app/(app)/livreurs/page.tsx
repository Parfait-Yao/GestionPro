"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Truck, MapPin, Package, Clock, CheckCircle, Phone, ShoppingBag, Trash2 } from "lucide-react";

type Employe = {
  id: string;
  nom: string;
  prenom: string;
  role: string;
  telephone: string | null;
  actif: boolean;
};

type Commande = {
  id: string;
  reference: string;
  client: string;
  telephoneClient: string | null;
  adresseLivraison: string | null;
  statut: string;
  commandeAt: string;
  quantite: number;
  produit: { nom: string };
  livreur: { id: string; nom: string; prenom: string } | null;
};

const STATUT_COLOR: Record<string, string> = {
  EN_ATTENTE:   "text-amber-600  bg-amber-50  border-amber-200",
  CONFIRMEE:    "text-blue-600   bg-blue-50   border-blue-200",
  EN_LIVRAISON: "text-primary bg-primary/10 border-primary/20",
  LIVREE:       "text-green-600  bg-green-50  border-green-200",
  ANNULEE:      "text-red-600    bg-red-50    border-red-200",
};
const STATUT_LABEL: Record<string, string> = {
  EN_ATTENTE: "En attente", CONFIRMEE: "Confirmée", EN_LIVRAISON: "En livraison",
  LIVREE: "Livrée", ANNULEE: "Annulée",
};

function initiales(nom: string, prenom: string) {
  return `${prenom[0] ?? ""}${nom[0] ?? ""}`.toUpperCase();
}

export default function LivreursPage() {
  const [livreurs, setLivreurs] = useState<Employe[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/employes").then((r) => r.json()),
      fetch("/api/commandes").then((r) => r.json()),
    ]).then(([emps, cmds]: [Employe[], Commande[]]) => {
      setLivreurs(emps.filter((e) => e.actif && (e.role === "LIVREUR" || e.role === "LIVREUSE")));
      setCommandes(cmds);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function supprimerLivreur(id: string, nomComplet: string) {
    if (!confirm(`Supprimer le livreur "${nomComplet}" ?`)) return;
    await fetch(`/api/employes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actif: false }),
    });
    setLivreurs((prev) => prev.filter((l) => l.id !== id));
  }

  const enCours = commandes.filter((c) => c.statut === "EN_LIVRAISON");
  const total = commandes.filter((c) => c.livreur !== null).length;
  const livrees = commandes.filter((c) => c.statut === "LIVREE").length;

  async function marquerLivree(id: string) {
    await fetch(`/api/commandes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: "LIVREE" }),
    });
    setCommandes((prev) => prev.map((c) => c.id === id ? { ...c, statut: "LIVREE" } : c));
  }

  return (
    <>
      <Header title="Livreurs" subtitle="Suivi des livraisons en temps réel" />
      <div className="flex-1 space-y-6 p-4 sm:p-6">

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl kpi-accent"><Truck className="h-6 w-6" /></div>
              <div><p className="text-2xl font-bold text-text-main">{livreurs.length}</p><p className="text-sm text-text-muted">Livreurs actifs</p></div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl kpi-primary"><Clock className="h-6 w-6" /></div>
              <div><p className="text-2xl font-bold text-text-main">{enCours.length}</p><p className="text-sm text-text-muted">En cours</p></div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl kpi-success"><CheckCircle className="h-6 w-6" /></div>
              <div><p className="text-2xl font-bold text-text-main">{livrees}</p><p className="text-sm text-text-muted">Livrées</p></div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Liste des livreurs */}
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-text-main">Équipe de livraison</h2>
            {loading ? (
              <p className="text-sm text-text-muted">Chargement…</p>
            ) : livreurs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 py-10 text-text-muted">
                  <Truck className="h-10 w-10 opacity-30" />
                  <p className="text-sm">Aucun livreur enregistré</p>
                  <p className="text-xs text-center">Ajoutez des employés avec le rôle Livreur ou Livreuse dans la section Employés.</p>
                </CardContent>
              </Card>
            ) : (
              livreurs.map((l, idx) => {
                const cmdLivreur = commandes.filter((c) => c.livreur?.id === l.id);
                const active = cmdLivreur.filter((c) => c.statut === "EN_LIVRAISON").length;
                const done = cmdLivreur.filter((c) => c.statut === "LIVREE").length;
                const GRADS = ["from-primary to-primary-light","from-accent to-accent-light","from-success to-emerald-500","from-info to-purple-500"];
                return (
                  <Card key={l.id} className="card-hover">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${GRADS[idx % GRADS.length]} text-sm font-bold text-white shadow-md`}>
                          {initiales(l.nom, l.prenom)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-text-main">{l.prenom} {l.nom}</p>
                          <p className="text-xs text-text-muted">{l.role === "LIVREUSE" ? "Livreuse" : "Livreur"}</p>
                          {l.telephone && (
                            <a href={`tel:${l.telephone}`} className="flex items-center gap-1 text-xs text-primary hover:underline mt-0.5">
                              <Phone className="h-3 w-3" />{l.telephone}
                            </a>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-primary">{active} en cours</p>
                          <p className="text-xs text-text-muted">{done} livrée{done > 1 ? "s" : ""}</p>
                        </div>
                        <button
                          onClick={() => supprimerLivreur(l.id, `${l.prenom} ${l.nom}`)}
                          className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger/10 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {active > 0 && (
                        <div className="mt-3 rounded-lg bg-primary/10 border border-primary/20 px-3 py-2">
                          <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                            <Truck className="h-3 w-3" />
                            {active} livraison{active > 1 ? "s" : ""} en cours
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Livraisons en cours */}
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-text-main">
              Livraisons en cours
              {enCours.length > 0 && (
                <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-white">
                  {enCours.length}
                </span>
              )}
            </h2>
            {enCours.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 py-10 text-text-muted">
                  <CheckCircle className="h-10 w-10 opacity-30 text-success" />
                  <p className="text-sm">Aucune livraison en cours</p>
                </CardContent>
              </Card>
            ) : (
              enCours.map((cmd) => (
                <Card key={cmd.id} className="card-hover border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-text-main truncate">{cmd.client}</p>
                        <p className="text-xs text-text-muted">{cmd.produit.nom} · {cmd.quantite} unité{cmd.quantite > 1 ? "s" : ""}</p>
                        <span className="mt-1 inline-block font-mono text-[11px] text-text-muted">{cmd.reference}</span>
                      </div>
                      <button
                        onClick={() => marquerLivree(cmd.id)}
                        className="shrink-0 flex items-center gap-1.5 rounded-lg bg-success text-white px-3 py-1.5 text-xs font-medium hover:bg-green-600 transition-colors shadow-sm"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />Livrée
                      </button>
                    </div>
                    {cmd.adresseLivraison && (
                      <div className="mt-2 flex items-start gap-1.5 text-xs text-text-muted">
                        <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span>{cmd.adresseLivraison}</span>
                      </div>
                    )}
                    {cmd.telephoneClient && (
                      <a href={`tel:${cmd.telephoneClient}`} className="mt-1 flex items-center gap-1.5 text-xs text-primary hover:underline">
                        <Phone className="h-3.5 w-3.5" />{cmd.telephoneClient}
                      </a>
                    )}
                    {cmd.livreur && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-text-muted">
                        <Truck className="h-3.5 w-3.5" />
                        {cmd.livreur.prenom} {cmd.livreur.nom}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}

            {/* Historique récent */}
            {commandes.filter((c) => c.statut === "LIVREE").length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-text-muted">Livrées récemment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  {commandes.filter((c) => c.statut === "LIVREE").slice(0, 5).map((cmd) => (
                    <div key={cmd.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                      <div>
                        <p className="font-medium text-text-main">{cmd.client}</p>
                        <p className="text-xs text-text-muted">{cmd.produit.nom}</p>
                      </div>
                      <span className="text-xs text-success font-medium flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />Livrée
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
