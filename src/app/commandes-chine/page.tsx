"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Home, Ship, Plus, Package, Pencil, Trash2, Loader, X, Check, ChevronLeft, ChevronRight, Boxes } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import {
  useCommandesChine,
  useCreateCommandeChine,
  useUpdateCommandeChine,
  useDeleteCommandeChine,
} from "@/hooks/useCommandesChine";

const PAGE_SIZE = 5;

export default function CommandesChinePage() {
  const { data: commandes = [], isLoading } = useCommandesChine();
  const createCommande = useCreateCommandeChine();
  const deleteCommande = useDeleteCommandeChine();

  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(commandes.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages - 1) setPage(0);
  }, [page, totalPages]);

  const pageTabs = useMemo(
    () =>
      Array.from({ length: totalPages }, (_, i) => {
        const start = i * PAGE_SIZE + 1;
        const end = Math.min((i + 1) * PAGE_SIZE, commandes.length);
        return { value: String(i), label: totalPages > 1 ? `${start}–${end}` : "Tout" };
      }),
    [totalPages, commandes.length]
  );

  const paginated = commandes.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!reference.trim()) return;
    setErrMsg("");
    createCommande.mutate(
      { reference: reference.trim(), note: note.trim() || undefined },
      {
        onSuccess: () => {
          setReference("");
          setNote("");
        },
        onError: (err) => setErrMsg(err.message),
      }
    );
  }

  function supprimer(id: string, reference: string) {
    if (!window.confirm(`Supprimer définitivement la commande « ${reference} » et tous ses cartons ?`)) return;
    setErrMsg("");
    deleteCommande.mutate(id, { onError: (e) => setErrMsg(e.message) });
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-card/95 backdrop-blur-sm px-4 py-4 sm:px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Ship className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-text-main sm:text-xl">Commandes Chine</h1>
          <p className="truncate text-xs text-text-muted sm:text-sm">Gestion des commandes et de leurs cartons</p>
        </div>
        {commandes.length > 0 && (
          <div className="hidden shrink-0 items-center gap-2 rounded-xl bg-accent/10 px-3 py-2 text-accent sm:flex">
            <Boxes className="h-4 w-4" />
            <span className="text-sm font-semibold">{commandes.length} commande{commandes.length > 1 ? "s" : ""}</span>
          </div>
        )}
        <Link href="/accueil">
          <Button variant="outline" size="sm">
            <Home className="h-4 w-4" />Retour à l&apos;accueil
          </Button>
        </Link>
      </header>

      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
        <Card>
          <CardContent className="p-5 sm:p-6">
            <form onSubmit={submitCreate} className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Input
                  label="Référence de la commande *"
                  placeholder="ex: A5"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  required
                />
              </div>
              <div className="flex-1">
                <Input
                  label="Note (optionnel)"
                  placeholder="ex: Commande de juillet"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <Button type="submit" variant="accent" disabled={createCommande.isPending || !reference.trim()}>
                {createCommande.isPending ? <Loader className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Créer la commande
              </Button>
            </form>
            {errMsg && <p className="mt-3 text-sm text-danger">{errMsg}</p>}
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-text-muted">Chargement…</div>
        ) : commandes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-text-muted">
            <Package className="h-12 w-12 opacity-30" />
            <p className="text-sm">Aucune commande Chine pour le moment</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {paginated.map((c) => (
                <CommandeCard
                  key={c.id}
                  commande={c}
                  editing={editingId === c.id}
                  onStartEdit={() => setEditingId(c.id)}
                  onStopEdit={() => setEditingId(null)}
                  onDelete={() => supprimer(c.id, c.reference)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-between">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-text-muted transition-colors hover:bg-surface hover:text-text-main disabled:opacity-30 disabled:hover:bg-card"
                  title="Page précédente"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <Tabs
                  tabs={pageTabs}
                  active={String(page)}
                  onChange={(v) => setPage(Number(v))}
                  className="overflow-x-auto"
                />

                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-text-muted transition-colors hover:bg-surface hover:text-text-main disabled:opacity-30 disabled:hover:bg-card"
                  title="Page suivante"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CommandeCard({
  commande,
  editing,
  onStartEdit,
  onStopEdit,
  onDelete,
}: {
  commande: { id: string; reference: string; note: string | null; cartons: unknown[] };
  editing: boolean;
  onStartEdit: () => void;
  onStopEdit: () => void;
  onDelete: () => void;
}) {
  const updateCommande = useUpdateCommandeChine(commande.id);
  const [reference, setReference] = useState(commande.reference);
  const [note, setNote] = useState(commande.note ?? "");
  const [errMsg, setErrMsg] = useState("");

  function save() {
    if (!reference.trim()) return;
    setErrMsg("");
    updateCommande.mutate(
      { reference: reference.trim(), note: note.trim() || undefined },
      {
        onSuccess: () => onStopEdit(),
        onError: (e) => setErrMsg(e.message),
      }
    );
  }

  if (editing) {
    return (
      <Card>
        <CardContent className="space-y-3 p-5">
          <Input label="Référence" value={reference} onChange={(e) => setReference(e.target.value)} />
          <Input label="Note" value={note} onChange={(e) => setNote(e.target.value)} />
          {errMsg && <p className="text-sm text-danger">{errMsg}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onStopEdit}>
              <X className="h-4 w-4" />Annuler
            </Button>
            <Button variant="accent" size="sm" onClick={save} disabled={updateCommande.isPending}>
              <Check className="h-4 w-4" />Enregistrer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-hover overflow-hidden">
      <CardContent className="flex items-start gap-3 p-5">
        <Link href={`/commandes-chine/${commande.id}`} className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent/60 text-sm font-bold text-white">
            {commande.reference.slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold text-text-main">{commande.reference}</p>
            {commande.note && <p className="mt-0.5 truncate text-sm text-text-muted">{commande.note}</p>}
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-text-muted">
              <Package className="h-3 w-3" />
              {commande.cartons.length} carton{commande.cartons.length > 1 ? "s" : ""}
            </span>
          </div>
        </Link>
        <div className="flex shrink-0 gap-1.5">
          <button
            onClick={onStartEdit}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-surface hover:text-text-main transition-colors"
            title="Modifier"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-red-50 hover:text-danger transition-colors"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
