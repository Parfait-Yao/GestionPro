"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Scale, LayoutGrid, PackagePlus } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { RadioCard } from "@/components/ui/RadioCard";
import { Button } from "@/components/ui/Button";
import { CalculPesee, type PeseeInput } from "./CalculPesee";
import { toast } from "sonner";

type Methode = "PESEE_ASSISTEE" | "COMPTAGE_GROUPE";
type Produit = { id: string; nom: string };

export function FormulaireReception() {
  const router = useRouter();
  const [produits, setProduits] = useState<Produit[]>([]);
  const [produitId, setProduitId] = useState("");
  const [methode, setMethode] = useState<Methode>("PESEE_ASSISTEE");
  const [pesee, setPesee] = useState<PeseeInput>({
    poidsEchantillon: "",
    nbUnitesEchantillon: "",
    poidsCartonPlein: "",
    tareCarton: "",
    quantiteAttendue: "",
    seuilTolerancePct: 3,
  });
  const [nbTas, setNbTas] = useState("");
  const [unitesParTas, setUnitesParTas] = useState("");
  const [note, setNote] = useState("");
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    fetch("/api/produits")
      .then((r) => r.json())
      .then((d: Produit[]) => { setProduits(d); if (d[0]) setProduitId(d[0].id); })
      .catch(() => toast.error("Impossible de charger les produits"));
  }, []);

  async function handleSubmit() {
    if (!produitId) {
      toast.error("Sélectionnez un produit");
      return;
    }
    if (!pesee.quantiteAttendue) {
      toast.error("La quantité attendue est requise");
      return;
    }

    const body: Record<string, unknown> = {
      produitId,
      methode,
      quantiteAttendue: pesee.quantiteAttendue,
      note,
    };

    if (methode === "PESEE_ASSISTEE") {
      if (!pesee.poidsEchantillon || !pesee.nbUnitesEchantillon || !pesee.poidsCartonPlein) {
        toast.error("Renseignez l'échantillon et le poids du carton");
        return;
      }
      Object.assign(body, {
        poidsEchantillon: pesee.poidsEchantillon,
        nbUnitesEchantillon: pesee.nbUnitesEchantillon,
        poidsCartonPlein: pesee.poidsCartonPlein,
        tarreUtilisee: pesee.tareCarton,
      });
    } else {
      if (!nbTas || !unitesParTas) {
        toast.error("Renseignez le nombre de tas et les unités par tas");
        return;
      }
      Object.assign(body, { nbTas, unitesParTas });
    }

    setEnvoi(true);
    try {
      const res = await fetch("/api/receptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const { error } = await res.json();
        toast.error(error ?? "Erreur lors de l'enregistrement");
        return;
      }
      toast.success("Réception enregistrée");
      router.push("/receptions");
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Colonne gauche : formulaire */}
      <div className="space-y-5">
        <Select label="Produit" value={produitId} onChange={(e) => setProduitId(e.target.value)}>
          {produits.map((p) => (
            <option key={p.id} value={p.id}>{p.nom}</option>
          ))}
        </Select>

        <div>
          <label className="mb-2 block text-sm font-medium text-text-main">Méthode de comptage</label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <RadioCard
              label="Pesée assistée"
              description="Recommandé — produits homogènes"
              icon={Scale}
              selected={methode === "PESEE_ASSISTEE"}
              onClick={() => setMethode("PESEE_ASSISTEE")}
            />
            <RadioCard
              label="Comptage groupé"
              description="Produits irréguliers"
              icon={LayoutGrid}
              selected={methode === "COMPTAGE_GROUPE"}
              onClick={() => setMethode("COMPTAGE_GROUPE")}
            />
          </div>
        </div>

        {methode === "COMPTAGE_GROUPE" && (
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nombre de tas" type="number" value={nbTas} onChange={(e) => setNbTas(e.target.value)} />
            <Input label="Unités par tas" type="number" value={unitesParTas} onChange={(e) => setUnitesParTas(e.target.value)} />
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-main">Note (optionnel)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-border bg-card p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            placeholder="Observations du gérant..."
          />
        </div>
      </div>

      {/* Colonne droite : preview live */}
      <div className="space-y-5">
        {methode === "PESEE_ASSISTEE" ? (
          <CalculPesee values={pesee} onChange={setPesee} />
        ) : (
          <Input label="Quantité attendue" type="number" value={pesee.quantiteAttendue} onChange={(e) => setPesee({ ...pesee, quantiteAttendue: e.target.value })} />
        )}

        <Button className="w-full" size="lg" variant="primary" onClick={handleSubmit} loading={envoi}>
          <PackagePlus className="h-4 w-4" />
          Valider la réception
        </Button>
      </div>
    </div>
  );
}
