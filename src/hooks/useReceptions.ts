import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { queryKeys } from "./queryKeys";

export type Reception = {
  id: string;
  produit: { nom: string; seuilTolerancePct: number };
  gerant: { nom: string; prenom: string };
  methode: string;
  quantiteAttendue: number;
  quantiteEstimee: number;
  ecartPct: number;
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
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.receptions }),
  });
}
