import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { queryKeys } from "./queryKeys";

export type Pointage = {
  id: string;
  employeId: string;
  entreeAt: string;
  sortieAt: string | null;
  employe: { id: string; nom: string; prenom: string; role: string };
};

export function usePointageOpen() {
  return useQuery({
    queryKey: queryKeys.pointageOpen,
    queryFn: () => apiFetch<Pointage[]>("/api/pointage?open=true"),
  });
}

export function usePointageJournal(date: string) {
  return useQuery({
    queryKey: queryKeys.pointageJournal(date),
    queryFn: () => apiFetch<Pointage[]>(`/api/pointage?date=${date}`),
    enabled: !!date,
  });
}

export function usePointerEntree() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (employeId: string) =>
      apiFetch<Pointage>("/api/pointage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeId }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.pointage }),
  });
}

export function usePointerSortie() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pointageId: string) => apiFetch<Pointage>(`/api/pointage/${pointageId}`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.pointage }),
  });
}

export function useDeletePointage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pointageId: string) => apiFetch<{ ok: true }>(`/api/pointage/${pointageId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.pointage }),
  });
}
