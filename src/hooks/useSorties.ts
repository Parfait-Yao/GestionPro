import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { queryKeys } from "./queryKeys";

export type Sortie = {
  id: string;
  produit: { id: string; nom: string; seuilSensibleQte: number };
  employe: { id: string; nom: string; prenom: string };
  motif: string;
  quantiteAnnoncee: number;
  quantiteConfirmee: number | null;
  ecartConstate: number | null;
  statut: string;
};

export type SortiePayload = {
  employeId: string;
  produitId: string;
  motif: string;
  quantiteAnnoncee: string | number;
  noteMotif?: string;
};

export function useSorties() {
  return useQuery({
    queryKey: queryKeys.sorties,
    queryFn: () => apiFetch<Sortie[]>("/api/sorties"),
  });
}

export function useCreateSortie() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SortiePayload) =>
      apiFetch<Sortie>("/api/sorties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.sorties }),
  });
}

export function useConfirmSortie() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantiteConfirmee }: { id: string; quantiteConfirmee: number }) =>
      apiFetch<Sortie>(`/api/sorties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantiteConfirmee }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.sorties }),
  });
}
