import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { queryKeys } from "./queryKeys";

export type MouvementSens = "ENTREE" | "SORTIE";

export type MouvementLigne = {
  id: string;
  produit: { id: string; nom: string };
  quantite: number;
};

export type Mouvement = {
  id: string;
  type: MouvementSens;
  employe: { id: string; nom: string; prenom: string };
  motif: string;
  noteMotif: string | null;
  statut: string;
  createdAt: string;
  lignes: MouvementLigne[];
};

export type MouvementLignePayload = { produitId: string; quantite: string | number };

export type MouvementPayload = {
  type: MouvementSens;
  employeId: string;
  motif: string;
  noteMotif?: string;
  lignes: MouvementLignePayload[];
};

export function useMouvements() {
  return useQuery({
    queryKey: queryKeys.mouvements,
    queryFn: () => apiFetch<Mouvement[]>("/api/mouvements"),
  });
}

export function useCreateMouvement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: MouvementPayload) =>
      apiFetch<Mouvement>("/api/mouvements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.mouvements }),
  });
}

export function useUpdateMouvement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<MouvementPayload>) =>
      apiFetch<Mouvement>(`/api/mouvements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.mouvements }),
  });
}
