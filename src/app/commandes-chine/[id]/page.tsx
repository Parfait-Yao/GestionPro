"use client";

import { useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Home, Package, Plus, Pencil, Trash2, Upload, Loader,
  X, Check, ImageIcon, CheckCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  useCommandeChine,
  useCreateCarton,
  useUpdateCarton,
  useDeleteCarton,
  type CartonChine,
} from "@/hooks/useCommandesChine";

async function uploadPhoto(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Erreur lors de l'upload");
  return data.url as string;
}

export default function CommandeChinePage() {
  const { id } = useParams<{ id: string }>();
  const { data: commande, isLoading } = useCommandeChine(id);
  const createCarton = useCreateCarton(id);

  const fileRef = useRef<HTMLInputElement>(null);
  const [identifiant, setIdentifiant] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const suggestion = useMemo(() => {
    if (!commande) return "";
    const n = commande.cartons.length + 1;
    return `${commande.reference}-#${String(n).padStart(2, "0")}`;
  }, [commande]);

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    setUploading(true);
    setErrMsg("");
    try {
      const url = await uploadPhoto(file);
      setPhotoUrl(url);
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Erreur lors de l'upload");
      setPhotoPreview(null);
    } finally {
      setUploading(false);
    }
  }

  function removePhoto() {
    setPhotoUrl(null);
    setPhotoPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

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
          removePhoto();
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
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-card/95 backdrop-blur-sm px-4 py-4 sm:px-6">
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
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-text-main">
              <Plus className="h-4 w-4 text-accent" />Ajouter un carton
            </h2>
            <form onSubmit={submitCarton} className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Input
                    label="Identifiant du carton"
                    placeholder={suggestion}
                    value={identifiant}
                    onChange={(e) => setIdentifiant(e.target.value)}
                  />
                </div>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                className="sr-only"
                onChange={handlePhoto}
              />
              {photoPreview ? (
                <div className="relative h-40 w-full max-w-xs overflow-hidden rounded-xl bg-surface">
                  <img src={photoPreview} alt="Aperçu" className="h-full w-full object-cover" />
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Loader className="h-8 w-8 animate-spin text-white" />
                    </div>
                  )}
                  {!uploading && (
                    <button type="button" onClick={removePhoto} className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  {photoUrl && !uploading && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-success px-2.5 py-1 text-xs text-white">
                      <CheckCircle className="h-3 w-3" />Photo uploadée
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex w-full max-w-xs flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface py-8 hover:border-accent hover:bg-accent/5 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                    <Upload className="h-5 w-5 text-accent" />
                  </div>
                  <p className="text-sm font-medium text-text-main">Prendre ou importer une photo</p>
                  <p className="text-xs text-text-muted">JPEG, PNG ou WebP · max 5 Mo</p>
                </button>
              )}

              {errMsg && <p className="text-sm text-danger">{errMsg}</p>}

              <div className="flex justify-end">
                <Button type="submit" variant="accent" disabled={createCarton.isPending || uploading}>
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

function CartonCard({ commandeChineId, carton }: { commandeChineId: string; carton: CartonChine }) {
  const updateCarton = useUpdateCarton(commandeChineId, carton.id);
  const deleteCarton = useDeleteCarton(commandeChineId);
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [identifiant, setIdentifiant] = useState(carton.identifiant);
  const [uploading, setUploading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

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
        {errMsg && <p className="text-xs text-danger">{errMsg}</p>}
      </CardContent>
    </Card>
  );
}
