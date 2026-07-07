import { ShoppingCart, Factory, Home, Wrench, MoreHorizontal, type LucideIcon } from "lucide-react";

export type MotifValue = "VENTE" | "TRANSFORMATION" | "USAGE_INTERNE" | "REMPLACEMENT_DEFECTUEUX" | "AUTRE";

export type MotifConfig = {
  value: MotifValue;
  label: string;
  icon: LucideIcon;
  bg: string;
  text: string;
};

export const MOTIFS: MotifConfig[] = [
  { value: "VENTE", label: "Vente", icon: ShoppingCart, bg: "bg-emerald-50", text: "text-emerald-600" },
  { value: "TRANSFORMATION", label: "Transformation", icon: Factory, bg: "bg-accent/10", text: "text-accent" },
  { value: "USAGE_INTERNE", label: "Usage interne", icon: Home, bg: "bg-info/10", text: "text-info" },
  { value: "REMPLACEMENT_DEFECTUEUX", label: "Remplacement défectueux", icon: Wrench, bg: "bg-amber-50", text: "text-amber-600" },
  { value: "AUTRE", label: "Autre", icon: MoreHorizontal, bg: "bg-slate-100", text: "text-slate-600" },
];

export const MOTIF_VALUES: MotifValue[] = MOTIFS.map((m) => m.value);

export const MOTIF_LABELS: Record<string, string> = Object.fromEntries(MOTIFS.map((m) => [m.value, m.label]));

export const MOTIF_ICON: Record<string, MotifConfig> = Object.fromEntries(MOTIFS.map((m) => [m.value, m]));

// Mapping motif -> mouvement_stock (journal bas niveau), pour une SORTIE.
export const MOUVEMENT_PAR_MOTIF_SORTIE: Record<
  MotifValue,
  { type: "VENTE" | "TRANSFORMATION_DEBUT" | "USAGE_INTERNE" | "REMPLACEMENT_DEFECTUEUX" | "CORRECTION_INVENTAIRE"; etatArrivee: "VENDU" | "EN_TRANSFORMATION" | "UTILISE_INTERNE" }
> = {
  VENTE: { type: "VENTE", etatArrivee: "VENDU" },
  TRANSFORMATION: { type: "TRANSFORMATION_DEBUT", etatArrivee: "EN_TRANSFORMATION" },
  USAGE_INTERNE: { type: "USAGE_INTERNE", etatArrivee: "UTILISE_INTERNE" },
  REMPLACEMENT_DEFECTUEUX: { type: "REMPLACEMENT_DEFECTUEUX", etatArrivee: "VENDU" },
  AUTRE: { type: "CORRECTION_INVENTAIRE", etatArrivee: "VENDU" },
};

// Une ENTREE manuelle (retour, correction) n'a pas de mapping par motif dédié —
// elle est journalisée comme une correction d'inventaire qui remet le produit en stock brut.
export const MOUVEMENT_ENTREE = { type: "CORRECTION_INVENTAIRE", etatArrivee: "EN_STOCK_BRUT" } as const;
