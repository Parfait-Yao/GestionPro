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

export type MouvementEscaladeDashboard = {
  id: string;
  produit: string;
  employe: string;
  qte: number;
};

export type EcartReceptionDashboard = {
  id: string;
  produit: string;
  gerant: string;
  quantiteAttendue: number;
  quantiteRecue: number;
  ecart: number;
  createdAt: string;
};

export type DashboardData = {
  kpis: {
    stockTotal: number;
    commandesCeMois: number;
    commandesEnAttente: number;
    commandesVariation: number;
    sortiesDuJour: number;
    mouvementsEscaladeCount: number;
    sortiesVariation: number;
    alertesOuvertes: number;
    receptionsCeMois: number;
    employesActifs: number;
    produitsCatalogue: number;
  };
  mouvementsGraph: { jour: string; mouvements: number }[];
  activites: ActiviteDashboard[];
  mouvementsEscalade: MouvementEscaladeDashboard[];
  ecartReceptions: EcartReceptionDashboard[];
};

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => apiFetch<DashboardData>("/api/dashboard"),
  });
}
