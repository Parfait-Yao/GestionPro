"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PackagePlus, ImageIcon, CheckCircle2, AlertTriangle, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn, libelleEcart } from "@/lib/utils";
import { useProduits } from "@/hooks/useProduits";
import { toast } from "sonner";

export function FormulaireReception() {
  const router = useRouter();
  const { data: produits = [] } = useProduits();

  const [produitId, setProduitId] = useState("");
  const [commandeChineId, setCommandeChineId] = useState("");
  const [cartonChineId, setCartonChineId] = useState("");
  const [quantiteAttendue, setQuantiteAttendue] = useState("");
  const [quantiteRecue, setQuantiteRecue] = useState("");
  const [note, setNote] = useState("");
  const [envoi, setEnvoi] = useState(false);

  const produit = useMemo(() => produits.find((p) => p.id === produitId), [produits, produitId]);

  // Cartons chinois liés au produit sélectionné (chaque carton porte sa commande et sa photo)
  const cartonsProduit = produit?.cartonsChine ?? [];

  // Commandes distinctes disponibles pour ce produit (déduites de ses cartons)
  const commandesProduit = useMemo(() => {
    const parId = new Map<string, { id: string; reference: string }>();
    for (const carton of cartonsProduit) {
      parId.set(carton.commandeChine.id, carton.commandeChine);
    }
    return Array.from(parId.values());
  }, [cartonsProduit]);

  const cartonsCommande = useMemo(
    () => cartonsProduit.filter((c) => c.commandeChine.id === commandeChineId),
    [cartonsProduit, commandeChineId]
  );

  const carton = useMemo(() => cartonsProduit.find((c) => c.id === cartonChineId), [cartonsProduit, cartonChineId]);

  const ecart = useMemo(() => {
    const attendu = Number(quantiteAttendue);
    const recue = Number(quantiteRecue);
    if (!quantiteAttendue || !quantiteRecue || Number.isNaN(attendu) || Number.isNaN(recue)) return null;
    return recue - attendu;
  }, [quantiteAttendue, quantiteRecue]);

  function choisirProduit(id: string) {
    setProduitId(id);
    const p = produits.find((x) => x.id === id);
    setQuantiteRecue(p ? String(p.quantite) : "");

    const cartons = p?.cartonsChine ?? [];
    if (cartons.length === 1) {
      setCommandeChineId(cartons[0].commandeChine.id);
      setCartonChineId(cartons[0].id);
    } else {
      setCommandeChineId("");
      setCartonChineId("");
    }
  }

  function choisirCommande(id: string) {
    setCommandeChineId(id);
    const cartons = cartonsProduit.filter((c) => c.commandeChine.id === id);
    setCartonChineId(cartons.length === 1 ? cartons[0].id : "");
  }

  async function handleSubmit() {
    if (!produitId) {
      toast.error("Sélectionnez un produit");
      return;
    }
    if (!quantiteAttendue) {
      toast.error("La quantité attendue est requise");
      return;
    }
    if (!quantiteRecue) {
      toast.error("La quantité reçue/comptée est requise");
      return;
    }

    setEnvoi(true);
    try {
      const res = await fetch("/api/receptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produitId,
          commandeChineId: commandeChineId || undefined,
          cartonChineId: cartonChineId || undefined,
          quantiteAttendue,
          quantiteRecue,
          note,
        }),
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
      {/* Colonne gauche : sélection produit / commande / carton */}
      <div className="space-y-5">
        <Select label="Produit" value={produitId} onChange={(e) => choisirProduit(e.target.value)}>
          <option value="">Sélectionner…</option>
          {produits.map((p) => (
            <option key={p.id} value={p.id}>{p.nom}</option>
          ))}
        </Select>

        {produit && (
          <div className="flex items-center gap-3 rounded-md border border-border bg-surface p-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-card">
              {produit.imageUrl ? (
                <img src={produit.imageUrl} alt={produit.nom} className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="h-6 w-6 text-text-muted/50" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text-main">{produit.nom}</p>
              <p className="text-xs text-text-muted">Quantité en stock : {produit.quantite}</p>
            </div>
          </div>
        )}

        <Select
          label="Commande"
          value={commandeChineId}
          onChange={(e) => choisirCommande(e.target.value)}
          disabled={!produit || commandesProduit.length === 0}
        >
          <option value="">
            {produit && commandesProduit.length === 0 ? "Aucune commande associée à ce produit" : "Sélectionner…"}
          </option>
          {commandesProduit.map((c) => (
            <option key={c.id} value={c.id}>{c.reference} (ID: {c.id})</option>
          ))}
        </Select>

        {commandeChineId && (
          <Select label="Carton" value={cartonChineId} onChange={(e) => setCartonChineId(e.target.value)}>
            <option value="">Sélectionner…</option>
            {cartonsCommande.map((c) => (
              <option key={c.id} value={c.id}>{c.identifiant}</option>
            ))}
          </Select>
        )}

        {carton && (
          <div className="flex items-center gap-3 rounded-md border border-border bg-surface p-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-card">
              {carton.photoUrl ? (
                <img src={carton.photoUrl} alt={carton.identifiant} className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="h-6 w-6 text-text-muted/50" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text-main">Carton {carton.identifiant}</p>
              <p className="truncate text-xs text-text-muted">Commande : {carton.commandeChine.reference}</p>
            </div>
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

      {/* Colonne droite : quantités et écart */}
      <div className="space-y-5">
        <Input
          label="Quantité attendue"
          type="number"
          inputMode="numeric"
          min={0}
          value={quantiteAttendue}
          onChange={(e) => setQuantiteAttendue(e.target.value)}
          placeholder="ex: 500"
        />
        <Input
          label="Quantité reçue (comptée)"
          type="number"
          inputMode="numeric"
          min={0}
          value={quantiteRecue}
          onChange={(e) => setQuantiteRecue(e.target.value)}
          placeholder="ex: 487"
        />

        <div
          className={cn(
            "rounded-lg border p-4 transition-colors",
            ecart === null && "border-border bg-surface",
            ecart === 0 && "border-success/30 bg-success/5",
            ecart !== null && ecart !== 0 && "border-warning/30 bg-warning/5"
          )}
        >
          {ecart === null ? (
            <p className="text-sm text-text-muted">
              Renseignez la quantité attendue et la quantité reçue pour voir l&apos;écart.
            </p>
          ) : (
            <div className="flex items-center gap-2 text-sm font-semibold">
              {ecart === 0 && <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />}
              {ecart < 0 && <ArrowDownCircle className="h-4 w-4 shrink-0 text-danger" />}
              {ecart > 0 && <ArrowUpCircle className="h-4 w-4 shrink-0 text-warning" />}
              <span className={cn(ecart === 0 ? "text-success" : "text-text-main")}>{libelleEcart(ecart)}</span>
              {ecart !== 0 && <AlertTriangle className="h-4 w-4 text-warning" />}
            </div>
          )}
        </div>

        <Button className="w-full" size="lg" variant="primary" onClick={handleSubmit} loading={envoi}>
          <PackagePlus className="h-4 w-4" />
          Valider la réception
        </Button>
      </div>
    </div>
  );
}
