export const queryKeys = {
  commandes: ["commandes"] as const,
  commande: (id: string) => ["commandes", id] as const,
  produits: ["produits"] as const,
  produit: (id: string) => ["produits", id] as const,
  employes: ["employes"] as const,
  sorties: ["sorties"] as const,
  receptions: ["receptions"] as const,
  pointage: ["pointage"] as const,
  pointageOpen: ["pointage", "open"] as const,
  pointageJournal: (date: string) => ["pointage", "journal", date] as const,
};