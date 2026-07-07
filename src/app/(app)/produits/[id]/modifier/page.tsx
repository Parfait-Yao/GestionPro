"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Package, ImageIcon, Upload, Camera, X, Loader, CheckCircle } from "lucide-react";
import { useProduit, useUpdateProduit } from "@/hooks/useProduits";

const CATEGORIES = ["Matière Première", "Produit Transformé", "Consommable", "Emballage", "Autre"];

export default function ModifierProduitPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const { data: produit, isLoading: chargement } = useProduit(params.id);
  const updateProduit = useUpdateProduit(params.id);

  const [form, setForm] = useState({
    nom: "", categorie: "", description: "", quantite: "0",
  });
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [statut, setStatut] = useState<"idle" | "loading" | "ok" | "erreur">("idle");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    if (!produit) return;
    setForm({
      nom: produit.nom ?? "",
      categorie: produit.categorie ?? "",
      description: produit.description ?? "",
      quantite: produit.quantite?.toString() ?? "0",
    });
    setImageUrl(produit.imageUrl ?? null);
    setImagePreview(produit.imageUrl ?? null);
  }, [produit]);

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
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
    updateProduit.mutate({ ...form, imageUrl }, {
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

  if (chargement) {
    return (
      <>
        <Header title="Modifier le produit" subtitle="Références, photos et quantités en stock" />
        <div className="flex items-center justify-center py-20 text-text-muted">Chargement…</div>
      </>
    );
  }

  return (
    <>
      <Header title="Modifier le produit" subtitle="Mettre à jour la référence, sa photo et sa quantité" />
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
                <input
                  ref={cameraRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  capture="environment"
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
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => cameraRef.current?.click()}
                      className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-surface py-10 hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Camera className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-text-main">Prendre une photo</p>
                        <p className="text-xs text-text-muted mt-1">Appareil photo du téléphone/tablette</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-surface py-10 hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Upload className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-text-main">Choisir un fichier</p>
                        <p className="text-xs text-text-muted mt-1">JPEG, PNG ou WebP · max 5 Mo</p>
                      </div>
                    </button>
                  </div>
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
                <Input label="Quantité en stock" type="number" min={0} placeholder="ex: 100" value={form.quantite} onChange={(e) => set("quantite", e.target.value)} />
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

            {errMsg && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errMsg}
              </div>
            )}
            {statut === "ok" && (
              <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                <CheckCircle className="h-4 w-4" />Produit mis à jour avec succès ! Redirection…
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => router.back()}>Annuler</Button>
              <Button type="submit" variant="accent" disabled={statut === "loading" || statut === "ok" || uploading}>
                {statut === "loading" ? (
                  <><Loader className="h-4 w-4 animate-spin" />Enregistrement…</>
                ) : (
                  <><Package className="h-4 w-4" />Enregistrer les modifications</>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
