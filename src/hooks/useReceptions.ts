import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { queryKeys } from "./queryKeys";

export type Reception = {
  id: string;
  produit: { nom: string };
  gerant: { nom: string; prenom: string };
  commandeChine: { id: string; reference: string } | null;
  cartonChine: { id: string; identifiant: string } | null;
  quantiteAttendue: number;
  quantiteRecue: number;
  ecart: number;
  createdAt: string;
};

export type ReceptionPayload = Record<string, unknown>;

export function useReceptions() {
  return useQuery({
    queryKey: queryKeys.receptions,
    queryFn: () => apiFetch<Reception[]>("/api/receptions"),
  });
}

export function useCreateReception() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ReceptionPayload) =>
      apiFetch<Reception>("/api/receptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.receptions });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },

  });
}
