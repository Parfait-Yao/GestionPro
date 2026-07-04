"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Package, ImageIcon, Upload, X, Loader, CheckCircle, Scale, Tag } from "lucide-react";
import { useCreateProduit } from "@/hooks/useProduits";

const CATEGORIES = ["Matière Première", "Produit Transformé", "Consommable", "Emballage", "Autre"];

export default function NouveauProduitPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const createProduit = useCreateProduit();

  const [form, setForm] = useState({
    nom: "", categorie: "", description: "",
    poidsUnitaireRef: "", tarreCarton: "", seuilTolerancePct: "3", seuilSensibleQte: "50",
  });
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [statut, setStatut] = useState<"idle" | "loading" | "ok" | "erreur">("idle");
  const [errMsg, setErrMsg] = useState("");

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Preview local
    setImagePreview(URL.createObjectURL(file));
    // Upload
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        setImageUrl(data.url);
      } else {
        const d = await res.json();
        setErrMsg(d.error ?? "Erreur lors de l'upload.");
        setImagePreview(null);
      }
    } finally {
      setUploading(false);
    }
  }

  function removeImage() {
    setImageUrl(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nom.trim()) { setErrMsg("Le nom du produit est requis."); return; }
    setStatut("loading");
    setErrMsg("");
    createProduit.mutate({ ...form, imageUrl }, {
      onSuccess: () => {
        setStatut("ok");
        setTimeout(() => router.push("/produits"), 1200);
      },
      onError: (err) => {
        setErrMsg(err.message);
        setStatut("erreur");
      },
    });
  }

  return (
    <>
      <Header title="Nouveau produit" subtitle="Créer une référence et ses seuils" />
      <div className="flex-1 p-4 sm:p-6">
        <div className="mx-auto max-w-2xl">
          <form onSubmit={submit} className="space-y-6">

            {/* Photo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  Photo du produit
                  <span className="ml-1 text-xs font-normal text-text-muted">(optionnel)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={handleImage}
                />
                {imagePreview ? (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden bg-surface">
                    <img src={imagePreview} alt="Aperçu" className="h-full w-full object-cover" />
                    {uploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Loader className="h-8 w-8 animate-spin text-white" />
                      </div>
                    )}
                    {!uploading && (
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    {imageUrl && !uploading && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-success px-2.5 py-1 text-xs text-white">
                        <CheckCircle className="h-3 w-3" />Photo uploadée
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-surface py-10 hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-text-main">Cliquer pour ajouter une photo</p>
                      <p className="text-xs text-text-muted mt-1">JPEG, PNG ou WebP · max 5 Mo</p>
                    </div>
                  </button>
                )}
              </CardContent>
            </Card>

            {/* Infos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="h-4 w-4 text-accent" />
                  Informations produit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label="Nom du produit *" placeholder="ex: Noix de Cajou Brut" value={form.nom} onChange={(e) => set("nom", e.target.value)} required />
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-text-main">Catégorie</label>
                    <select
                      value={form.categorie}
                      onChange={(e) => set("categorie", e.target.value)}
                      className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Sélectionner…</option>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text-main">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Description détaillée du produit…"
                    rows={3}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Seuils */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Scale className="h-4 w-4 text-warning" />
                  Paramètres techniques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label="Poids unitaire de référence (g)" type="number" placeholder="ex: 7" value={form.poidsUnitaireRef} onChange={(e) => set("poidsUnitaireRef", e.target.value)} />
                  <Input label="Tare carton (kg)" type="number" placeholder="ex: 1.2" value={form.tarreCarton} onChange={(e) => set("tarreCarton", e.target.value)} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Input label="Tolérance pesée (%)" type="number" min={0} max={100} value={form.seuilTolerancePct} onChange={(e) => set("seuilTolerancePct", e.target.value)} />
                    <p className="mt-1 text-xs text-text-muted">Écart acceptable entre quantité attendue et estimée</p>
                  </div>
                  <div>
                    <Input label="Seuil escalade (unités)" type="number" min={0} value={form.seuilSensibleQte} onChange={(e) => set("seuilSensibleQte", e.target.value)} />
                    <p className="mt-1 text-xs text-text-muted">Écart déclenchant une escalade vers la patronne</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {errMsg && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errMsg}
              </div>
            )}
            {statut === "ok" && (
              <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                <CheckCircle className="h-4 w-4" />Produit créé avec succès ! Redirection…
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => router.back()}>Annuler</Button>
              <Button type="submit" variant="accent" disabled={statut === "loading" || statut === "ok" || uploading}>
                {statut === "loading" ? (
                  <><Loader className="h-4 w-4 animate-spin" />Création…</>
                ) : (
                  <><Package className="h-4 w-4" />Créer le produit</>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
