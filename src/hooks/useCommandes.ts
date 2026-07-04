import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { queryKeys } from "./queryKeys";

export type CommandeStatut = "EN_ATTENTE" | "CONFIRMEE" | "EN_LIVRAISON" | "LIVREE" | "ANNULEE";

export type Commande = {
  id: string;
  reference: string;
  client: string;
  telephoneClient: string | null;
  adresseLivraison: string | null;
  quantite: number;
  prixUnitaire: number | null;
  statut: CommandeStatut;
  commandeAt: string;
  livraisonAt: string | null;
  note: string | null;
  produit: { id: string; nom: string; categorie: string | null; imageUrl: string | null };
  livreur: { id: string; nom: string; prenom: string; role: string } | null;
};

export type CommandePayload = {
  client: string;
  telephoneClient?: string;
  adresseLivraison?: string;
  produitId: string;
  quantite: string | number;
  prixUnitaire?: string | number;
  livreurId?: string;
  note?: string;
};

const GERANT_ID = "seed-patronne-brou";

export function useCommandes() {
  return useQuery({
    queryKey: queryKeys.commandes,
    queryFn: () => apiFetch<Commande[]>("/api/commandes"),
  });
}

export function useCommande(id: string) {
  return useQuery({
    queryKey: queryKeys.commande(id),
    queryFn: () => apiFetch<Commande>(`/api/commandes/${id}`),
    enabled: !!id,
  });
}

export function useCreateCommande() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CommandePayload) =>
      apiFetch<Commande>("/api/commandes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, gerantId: GERANT_ID }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.commandes }),
  });
}

export function useUpdateCommande(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CommandePayload> & { statut?: CommandeStatut }) =>
      apiFetch<Commande>(`/api/commandes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.commandes });
      qc.invalidateQueries({ queryKey: queryKeys.commande(id) });
    },
  });
}

export function useUpdateCommandeStatut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: CommandeStatut }) =>
      apiFetch<Commande>(`/api/commandes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.commandes }),
  });
}

export function useDeleteCommande() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<{ ok: true }>(`/api/commandes/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.commandes }),
  });
}