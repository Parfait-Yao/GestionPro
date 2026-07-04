"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { RadioCard } from "@/components/ui/RadioCard";
import { Button } from "@/components/ui/Button";
import { ShoppingCart, Factory, Home, Wrench, MoreHorizontal, PackageMinus } from "lucide-react";
import { toast } from "sonner";

type Employe = { id: string; nom: string; prenom: string; actif: boolean };
type Produit = { id: string; nom: string };

const motifs = [
  { value: "VENTE", label: "Vente", icon: ShoppingCart },
  { value: "TRANSFORMATION", label: "Transformation", icon: Factory },
  { value: "USAGE_INTERNE", label: "Usage interne", icon: Home },
  { value: "REMPLACEMENT_DEFECTUEUX", label: "Remplacement défectueux", icon: Wrench },
  { value: "AUTRE", label: "Autre", icon: MoreHorizontal },
];

export default function NouvelleSortiePage() {
  const router = useRouter();
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [employeId, setEmployeId] = useState("");
  const [produitId, setProduitId] = useState("");
  const [motif, setMotif] = useState("VENTE");
  const [quantite, setQuantite] = useState("");
  const [note, setNote] = useState("");
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/employes").then((r) => r.json()),
      fetch("/api/produits").then((r) => r.json()),
    ])
      .then(([e, p]: [Employe[], Produit[]]) => {
        const actifs = e.filter((emp) => emp.actif);
        setEmployes(actifs);
        setProduits(p);
        if (actifs[0]) setEmployeId(actifs[0].id);
        if (p[0]) setProduitId(p[0].id);
      })
      .catch(() => toast.error("Impossible de charger employés/produits"));
  }, []);

  async function handleSubmit() {
    if (!employeId || !produitId) {
      toast.error("Sélectionnez un employé et un produit");
      return;
    }
    if (!quantite || Number(quantite) <= 0) {
      toast.error("Quantité annoncée invalide");
      return;
    }

    setEnvoi(true);
    try {
      const res = await fetch("/api/sorties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeId, produitId, motif, quantiteAnnoncee: quantite, noteMotif: note }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur lors de l'enregistrement");
        return;
      }
      toast.success("Annonce enregistrée — l'employé peut entrer");
      router.push("/sorties");
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <>
      <Header title="Annoncer une sortie" subtitle="Étape 1 — avant l'entrée de l'employé en entrepôt" />
      <div className="flex-1 p-4 sm:p-6">
        <Card>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Select label="Employé concerné" value={employeId} onChange={(e) => setEmployeId(e.target.value)}>
                {employes.map((e) => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
              </Select>
              <Select label="Produit" value={produitId} onChange={(e) => setProduitId(e.target.value)}>
                {produits.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-text-main">Motif</label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {motifs.map((m) => (
                  <RadioCard key={m.value} label={m.label} icon={m.icon} selected={motif === m.value} onClick={() => setMotif(m.value)} />
                ))}
              </div>
            </div>

            <Input label="Quantité annoncée" type="number" value={quantite} onChange={(e) => setQuantite(e.target.value)} placeholder="ex: 20" />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-main">Note (optionnel)</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="w-full rounded-md border border-border bg-card p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>

            <Button className="w-full" size="lg" onClick={handleSubmit} loading={envoi}>
              <PackageMinus className="h-4 w-4" />
              Enregistrer l&apos;annonce
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
