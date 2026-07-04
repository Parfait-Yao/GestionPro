"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ShoppingBag, User, Package, Truck, Loader, CheckCircle } from "lucide-react";
import { useCreateCommande } from "@/hooks/useCommandes";
import { useProduits } from "@/hooks/useProduits";
import { useEmployes } from "@/hooks/useEmployes";

export default function NouvelleCommandePage() {
  const router = useRouter();
  const { data: produits = [] } = useProduits();
  const { data: employes = [] } = useEmployes();
  const livreurs = employes.filter((e) => e.role === "LIVREUR" || e.role === "LIVREUSE");
  const createCommande = useCreateCommande();
  const [form, setForm] = useState({
    client: "", telephoneClient: "", adresseLivraison: "",
    produitId: "", quantite: "1", prixUnitaire: "", livreurId: "", note: "",
  });
  const [statut, setStatut] = useState<"idle" | "loading" | "ok" | "erreur">("idle");
  const [errMsg, setErrMsg] = useState("");

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.client.trim() || !form.produitId || !form.quantite) {
      setErrMsg("Client, produit et quantité sont requis.");
      return;
    }
    setStatut("loading");
    setErrMsg("");
    createCommande.mutate(form, {
      onSuccess: () => {
        setStatut("ok");
        setTimeout(() => router.push("/commandes"), 1200);
      },
      onError: (err) => {
        setErrMsg(err.message);
        setStatut("erreur");
      },
    });
  }

  return (
    <>
      <Header title="Nouvelle commande" subtitle="Enregistrer une commande client" />
      <div className="flex-1 p-4 sm:p-6">
        <div className="mx-auto max-w-2xl">
          <form onSubmit={submit} className="space-y-6">

            {/* Client */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4 text-primary" />
                  Informations client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input label="Nom du client *" placeholder="ex: Koffi Dupont" value={form.client} onChange={(e) => set("client", e.target.value)} required />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label="Téléphone" type="tel" placeholder="+225 07 00 00 00 00" value={form.telephoneClient} onChange={(e) => set("telephoneClient", e.target.value)} />
                  <Input label="Adresse de livraison" placeholder="Quartier, rue…" value={form.adresseLivraison} onChange={(e) => set("adresseLivraison", e.target.value)} />
                </div>
              </CardContent>
            </Card>

            {/* Produit */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="h-4 w-4 text-accent" />
                  Produit commandé
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text-main">Produit *</label>
                  <select
                    value={form.produitId}
                    onChange={(e) => set("produitId", e.target.value)}
                    required
                    className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Sélectionner un produit…</option>
                    {produits.map((p) => (
                      <option key={p.id} value={p.id}>{p.nom}{p.categorie ? ` — ${p.categorie}` : ""}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Quantité *" type="number" min={1} value={form.quantite} onChange={(e) => set("quantite", e.target.value)} required />
                  <Input label="Prix unitaire (FCFA)" type="number" min={0} placeholder="Optionnel" value={form.prixUnitaire} onChange={(e) => set("prixUnitaire", e.target.value)} />
                </div>
              </CardContent>
            </Card>

            {/* Livreur */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Truck className="h-4 w-4 text-blue-600" />
                  Livreur assigné
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text-main">Livreur (optionnel)</label>
                  <select
                    value={form.livreurId}
                    onChange={(e) => set("livreurId", e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Assigner plus tard…</option>
                    {livreurs.map((l) => (
                      <option key={l.id} value={l.id}>{l.prenom} {l.nom}</option>
                    ))}
                  </select>
                  {livreurs.length === 0 && (
                    <p className="text-xs text-text-muted mt-1">Aucun livreur disponible. Ajoutez des employés avec le rôle Livreur.</p>
                  )}
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-text-main mb-1.5">Note (optionnel)</label>
                  <textarea
                    value={form.note}
                    onChange={(e) => set("note", e.target.value)}
                    placeholder="Instructions spéciales, remarques…"
                    rows={3}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {errMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {errMsg}
              </div>
            )}
            {statut === "ok" && (
              <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                <CheckCircle className="h-4 w-4" />Commande créée ! Redirection…
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => router.back()}>Annuler</Button>
              <Button type="submit" variant="accent" disabled={statut === "loading" || statut === "ok"}>
                {statut === "loading" ? (
                  <><Loader className="h-4 w-4 animate-spin" />Création…</>
                ) : (
                  <><ShoppingBag className="h-4 w-4" />Créer la commande</>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
