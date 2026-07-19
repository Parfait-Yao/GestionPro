"use client";

import { useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowLeft, Home, Package, Plus, Pencil, Trash2, Upload, Loader,
  X, Check, ImageIcon
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ImageUpload } from "@/components/ui/ImageUpload";
import {
  useCommandeChine,
  useCreateCarton,
  useUpdateCarton,
  useDeleteCarton,
  type CartonChine,
} from "@/hooks/useCommandesChine";
import { useUpdateProduit, useDeleteProduit } from "@/hooks/useProduits";
import { queryKeys } from "@/hooks/queryKeys";

const CATEGORIES = ["Matière Première", "Produit Transformé", "Consommable", "Emballage", "Autre"];

async function uploadPhoto(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", "cartons");
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Erreur lors de l'upload");
  return data.url as string;
}

export default function CommandeChinePage() {
  const { id } = useParams<{ id: string }>();
  const { data: commande, isLoading } = useCommandeChine(id);
  const createCarton = useCreateCarton(id);

  const [identifiant, setIdentifiant] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState("");

  const suggestion = useMemo(() => {
    if (!commande) return "";
    const n = commande.cartons.length + 1;
    return `${commande.reference}-#${String(n).padStart(2, "0")}`;
  }, [commande]);

  function submitCarton(e: React.FormEvent) {
    e.preventDefault();
    const value = identifiant.trim() || suggestion;
    if (!value) return;
    setErrMsg("");
    createCarton.mutate(
      { identifiant: value, photoUrl },
      {
        onSuccess: () => {
          setIdentifiant("");
          setPhotoUrl(null);
        },
        onError: (err) => setErrMsg(err.message),
      }
    );
  }

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-text-muted">Chargement…</div>;
  }

  if (!commande) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-text-muted">
        <p>Commande introuvable.</p>
        <Link href="/commandes-chine"><Button variant="outline"><ArrowLeft className="h-4 w-4" />Retour</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border theme-card backdrop-blur-sm px-4 py-4 sm:px-6">
        <Link href="/commandes-chine" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-text-muted hover:bg-border hover:text-text-main transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-text-main sm:text-xl">Commande {commande.reference}</h1>
          {commande.note && <p className="truncate text-xs text-text-muted sm:text-sm">{commande.note}</p>}
        </div>
        <Link href="/accueil">
          <Button variant="outline" size="sm">
            <Home className="h-4 w-4" />Retour à l&apos;accueil
          </Button>
        </Link>
      </header>

      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
        <Card>
          <CardContent className="p-5 sm:p-6">
            <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-text-main">
              <Plus className="h-4 w-4 text-accent" />Ajouter un carton
            </h2>
            <form onSubmit={submitCarton} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:items-start">
                <Input
                  label="Identifiant du carton"
                  placeholder={suggestion}
                  value={identifiant}
                  onChange={(e) => setIdentifiant(e.target.value)}
                />

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-main">Photo du carton</label>
                  <ImageUpload value={photoUrl ?? undefined} onChange={(url) => setPhotoUrl(url || null)} folder="cartons" />
                </div>
              </div>

              {errMsg && <p className="text-sm text-danger">{errMsg}</p>}

              <div className="flex justify-end">
                <Button type="submit" variant="accent" className="w-full sm:w-auto" disabled={createCarton.isPending}>
                  {createCarton.isPending ? <Loader className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Ajouter le carton
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {commande.cartons.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-text-muted">
            <Package className="h-12 w-12 opacity-30" />
            <p className="text-sm">Aucun carton pour cette commande</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {commande.cartons.map((carton) => (
              <CartonCard key={carton.id} commandeChineId={id} carton={carton} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const EMPTY_PRODUIT = { nom: "", categorie: "", description: "", quantite: "0" };

function CartonCard({ commandeChineId, carton }: { commandeChineId: string; carton: CartonChine }) {
  const qc = useQueryClient();
  const updateCarton = useUpdateCarton(commandeChineId, carton.id);
  const deleteCarton = useDeleteCarton(commandeChineId);
  const updateProduit = useUpdateProduit(carton.produit?.id ?? "");
  const deleteProduit = useDeleteProduit();
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [identifiant, setIdentifiant] = useState(carton.identifiant);
  const [uploading, setUploading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const [showProduitModal, setShowProduitModal] = useState(false);
  const [isEditingProduit, setIsEditingProduit] = useState(false);
  const [produit, setProduit] = useState(EMPTY_PRODUIT);
  const [produitPhotoUrl, setProduitPhotoUrl] = useState<string | null>(null);
  const [produitErr, setProduitErr] = useState("");

  function setProduitField(k: keyof typeof produit, v: string) {
    setProduit((p) => ({ ...p, [k]: v }));
  }

  function openCreateProduit() {
    setIsEditingProduit(false);
    setProduit(EMPTY_PRODUIT);
    setProduitPhotoUrl(null);
    setProduitErr("");
    setShowProduitModal(true);
  }

  function openEditProduit() {
    if (!carton.produit) return;
    setIsEditingProduit(true);
    setProduit({
      nom: carton.produit.nom,
      categorie: carton.produit.categorie ?? "",
      description: carton.produit.description ?? "",
      quantite: String(carton.produit.quantite),
    });
    setProduitPhotoUrl(carton.produit.imageUrl ?? null);
    setProduitErr("");
    setShowProduitModal(true);
  }

  function submitProduit(e: React.FormEvent) {
    e.preventDefault();
    if (!produit.nom.trim()) {
      setProduitErr("Le nom du produit est requis");
      return;
    }
    setProduitErr("");
    if (isEditingProduit && carton.produit) {
      updateProduit.mutate(
        { ...produit, imageUrl: produitPhotoUrl },
        {
          onSuccess: () => setShowProduitModal(false),
          onError: (err) => setProduitErr(err.message),
        }
      );
    } else {
      updateCarton.mutate(
        { produit: { ...produit, imageUrl: produitPhotoUrl } },
        {
          onSuccess: () => setShowProduitModal(false),
          onError: (err) => setProduitErr(err.message),
        }
      );
    }
  }

  function supprimerProduit() {
    if (!carton.produit) return;
    if (!window.confirm(`Supprimer le produit « ${carton.produit.nom} » ?`)) return;
    setErrMsg("");
    deleteProduit.mutate(carton.produit.id, {
      onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.commandeChine(commandeChineId) }),
      onError: (err) => setErrMsg(err.message),
    });
  }

  async function replacePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErrMsg("");
    try {
      const url = await uploadPhoto(file);
      updateCarton.mutate({ photoUrl: url }, { onError: (err) => setErrMsg(err.message) });
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  }

  function save() {
    if (!identifiant.trim()) return;
    setErrMsg("");
    updateCarton.mutate(
      { identifiant: identifiant.trim() },
      { onSuccess: () => setEditing(false), onError: (err) => setErrMsg(err.message) }
    );
  }

  function supprimer() {
    if (!window.confirm(`Supprimer le carton « ${carton.identifiant} » ?`)) return;
    deleteCarton.mutate(carton.id, { onError: (err) => setErrMsg(err.message) });
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative h-40 w-full bg-surface">
        {carton.photoUrl ? (
          <img src={carton.photoUrl} alt={carton.identifiant} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-muted">
            <ImageIcon className="h-8 w-8 opacity-30" />
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="sr-only" onChange={replacePhoto} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
          title="Remplacer la photo"
        >
          <Upload className="h-4 w-4" />
        </button>
      </div>
      <CardContent className="space-y-2 p-4">
        {editing ? (
          <div className="space-y-2">
            <Input value={identifiant} onChange={(e) => setIdentifiant(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => { setEditing(false); setIdentifiant(carton.identifiant); }}>
                <X className="h-3.5 w-3.5" />
              </Button>
              <Button variant="accent" size="sm" onClick={save} disabled={updateCarton.isPending}>
                <Check className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-semibold text-text-main">{carton.identifiant}</p>
            <div className="flex shrink-0 gap-1">
              <button onClick={() => setEditing(true)} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface hover:text-text-main transition-colors" title="Renommer">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={supprimer} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-red-50 hover:text-danger transition-colors" title="Supprimer">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {carton.produit ? (
          <div className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2">
            {carton.produit.imageUrl ? (
              <img src={carton.produit.imageUrl} alt={carton.produit.nom} className="h-9 w-9 shrink-0 rounded-md object-cover" />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-card">
                <Package className="h-3.5 w-3.5 text-accent" />
              </div>
            )}
            <p className="min-w-0 flex-1 truncate text-xs text-text-main">
              <span className="font-medium">{carton.produit.nom}</span> · {carton.produit.quantite} unités
            </p>
            <div className="flex shrink-0 gap-0.5">
              <button type="button" onClick={openEditProduit} className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-card hover:text-text-main transition-colors" title="Modifier le produit">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={supprimerProduit} className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-red-50 hover:text-danger transition-colors" title="Supprimer le produit">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <Button type="button" variant="outline" size="sm" className="w-full" onClick={openCreateProduit}>
            <Package className="h-3.5 w-3.5" />Enregistrer le produit de ce carton
          </Button>
        )}

        {errMsg && <p className="text-xs text-danger">{errMsg}</p>}
      </CardContent>

      <Modal
        open={showProduitModal}
        onClose={() => setShowProduitModal(false)}
        title={isEditingProduit ? `Modifier le produit — ${carton.identifiant}` : `Produit du carton ${carton.identifiant}`}
      >
        <form onSubmit={submitProduit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-text-main">Photo du produit</label>
              <ImageUpload value={produitPhotoUrl ?? undefined} onChange={(url) => setProduitPhotoUrl(url || null)} folder="produits" />
            </div>
            <div className="sm:col-span-2">
              <Input
                label="Nom du produit *"
                placeholder="ex: Noix de Cajou Brut"
                value={produit.nom}
                onChange={(e) => setProduitField("nom", e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-main">Catégorie</label>
              <select
                value={produit.categorie}
                onChange={(e) => setProduitField("categorie", e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Sélectionner…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Input
              label="Quantité"
              type="number"
              min={0}
              placeholder="ex: 100"
              value={produit.quantite}
              onChange={(e) => setProduitField("quantite", e.target.value)}
            />
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-sm font-medium text-text-main">Description</label>
              <textarea
                value={produit.description}
                onChange={(e) => setProduitField("description", e.target.value)}
                placeholder="Description détaillée du produit…"
                rows={3}
                className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </div>

          {produitErr && <p className="text-sm text-danger">{produitErr}</p>}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setShowProduitModal(false)}>
              Annuler
            </Button>
            <Button
              type="submit"
              variant="accent"
              disabled={isEditingProduit ? updateProduit.isPending : updateCarton.isPending}
            >
              {(isEditingProduit ? updateProduit.isPending : updateCarton.isPending) ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : isEditingProduit ? (
                <Check className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {isEditingProduit ? "Enregistrer les modifications" : "Enregistrer le produit"}
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}
