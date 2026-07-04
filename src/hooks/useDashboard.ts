import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { queryKeys } from "./queryKeys";

export type ActiviteDashboard = {
  id: string;
  type: "reception" | "sortie" | "alerte" | "pointage";
  titre: string;
  detail: string;
  temps: string;
};

export type SortieEnAttenteDashboard = {
  id: string;
  produit: string;
  employe: string;
  qte: number;
};

export type DashboardData = {
  kpis: {
    stockTotal: number;
    commandesCeMois: number;
    commandesEnAttente: number;
    commandesVariation: number;
    sortiesDuJour: number;
    sortiesEnAttenteCount: number;
    sortiesVariation: number;
    alertesOuvertes: number;
    receptionsCeMois: number;
    employesActifs: number;
    produitsCatalogue: number;
  };
  mouvementsGraph: { jour: string; mouvements: number }[];
  activites: ActiviteDashboard[];
  sortiesEnAttente: SortieEnAttenteDashboard[];
};

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => apiFetch<DashboardData>("/api/dashboard"),
  });
}
