import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { queryKeys } from "./queryKeys";
import type { LigneStock } from "@/components/stock/TableauStock";

export type RepartitionEtat = { name: string; value: number; color: string };

export type StockData = {
  stock: LigneStock[];
  repartition: RepartitionEtat[];
};

export function useStock() {
  return useQuery({
    queryKey: queryKeys.stock,
    queryFn: () => apiFetch<StockData>("/api/stock"),
  });
}
