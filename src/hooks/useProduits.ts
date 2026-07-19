import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { queryKeys } from "./queryKeys";

export type Produit = {
  id: string;
  nom: string;
  categorie: string | null;
  description: string | null;
  imageUrl: string | null;
  quantite: number;
  actif: boolean;
  cartonsChine?: {
    id: string;
    identifiant: string;
    photoUrl: string | null;
    commandeChine: { id: string; reference: string };
  }[];
};

export type ProduitPayload = {
  nom: string;
  categorie?: string;
  description?: string;
  imageUrl?: string | null;
  quantite?: string | number;
};

export function useProduits() {
  return useQuery({
    queryKey: queryKeys.produits,
    queryFn: () => apiFetch<Produit[]>("/api/produits"),
  });
}

export function useProduit(id: string) {
  return useQuery({
    queryKey: queryKeys.produit(id),
    queryFn: () => apiFetch<Produit>(`/api/produits/${id}`),
    enabled: !!id,
  });
}

export function useUpdateProduit(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ProduitPayload>) =>
      apiFetch<Produit>(`/api/produits/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.produits });
      qc.invalidateQueries({ queryKey: queryKeys.produit(id) });
    },
  });
}

export function useDeleteProduit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<{ ok: true }>(`/api/produits/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.produits }),
  });
}