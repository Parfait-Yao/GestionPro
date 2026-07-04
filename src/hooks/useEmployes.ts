import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { queryKeys } from "./queryKeys";

export type Employe = {
  id: string;
  nom: string;
  prenom: string;
  role: string;
  telephone: string | null;
  actif: boolean;
  createdAt: string;
};

export type EmployePayload = {
  nom: string;
  prenom: string;
  telephone?: string;
  role: string;
};

export function useEmployes() {
  return useQuery({
    queryKey: queryKeys.employes,
    queryFn: () => apiFetch<Employe[]>("/api/employes"),
  });
}

export function useCreateEmploye() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: EmployePayload) =>
      apiFetch<Employe>("/api/employes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.employes }),
  });
}

export function useUpdateEmploye() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<EmployePayload> & { actif?: boolean }) =>
      apiFetch<Employe>(`/api/employes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.employes }),
  });
}