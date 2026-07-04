import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { queryKeys } from "./queryKeys";

export type Alerte = {
  id: string;
  produit: string | null;
  ecartQuantite: number;
  periodeDebut: string;
  periodeFin: string;
  gerantEnPoste: string;
  employesConcernes: unknown;
  statut: string;
  createdAt: string;
  resolueAt: string | null;
};

export type AlertesData = {
  alertes: Alerte[];
  stats: { ouvertes: number; enCours: number; resoluesCeMois: number };
};

export function useAlertes() {
  return useQuery({
    queryKey: queryKeys.alertes,
    queryFn: () => apiFetch<AlertesData>("/api/alertes"),
  });
}
