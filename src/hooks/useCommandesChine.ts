import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { queryKeys } from "./queryKeys";

export type CartonChine = {
  id: string;
  commandeChineId: string;
  identifiant: string;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CommandeChine = {
  id: string;
  reference: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  cartons: CartonChine[];
};

export function useCommandesChine() {
  return useQuery({
    queryKey: queryKeys.commandesChine,
    queryFn: () => apiFetch<CommandeChine[]>("/api/commandes-chine"),
  });
}

export function useCommandeChine(id: string) {
  return useQuery({
    queryKey: queryKeys.commandeChine(id),
    queryFn: () => apiFetch<CommandeChine>(`/api/commandes-chine/${id}`),
    enabled: !!id,
  });
}

export function useCreateCommandeChine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { reference: string; note?: string }) =>
      apiFetch<CommandeChine>("/api/commandes-chine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.commandesChine }),
  });
}

export function useUpdateCommandeChine(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { reference?: string; note?: string }) =>
      apiFetch<CommandeChine>(`/api/commandes-chine/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.commandesChine });
      qc.invalidateQueries({ queryKey: queryKeys.commandeChine(id) });
    },
  });
}

export function useDeleteCommandeChine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<{ ok: true }>(`/api/commandes-chine/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.commandesChine }),
  });
}

export function useCreateCarton(commandeChineId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { identifiant: string; photoUrl?: string | null }) =>
      apiFetch<CartonChine>(`/api/commandes-chine/${commandeChineId}/cartons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.commandeChine(commandeChineId) });
      qc.invalidateQueries({ queryKey: queryKeys.commandesChine });
    },
  });
}

export function useUpdateCarton(commandeChineId: string, cartonId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { identifiant?: string; photoUrl?: string | null }) =>
      apiFetch<CartonChine>(`/api/commandes-chine/${commandeChineId}/cartons/${cartonId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.commandeChine(commandeChineId) });
      qc.invalidateQueries({ queryKey: queryKeys.commandesChine });
    },
  });
}

export function useDeleteCarton(commandeChineId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cartonId: string) =>
      apiFetch<{ ok: true }>(`/api/commandes-chine/${commandeChineId}/cartons/${cartonId}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.commandeChine(commandeChineId) });
      qc.invalidateQueries({ queryKey: queryKeys.commandesChine });
    },
  });
}
