import { ShoppingCart, Factory, Home, Wrench, MoreHorizontal, PackagePlus, type LucideIcon } from "lucide-react";

export type MotifValue =
  | "VENTE"
  | "TRANSFORMATION"
  | "USAGE_INTERNE"
  | "REMPLACEMENT_DEFECTUEUX"
  | "CORRECTION_INVENTAIRE"
  | "AUTRE";

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
  { value: "CORRECTION_INVENTAIRE", label: "Correction / retour", icon: PackagePlus, bg: "bg-blue-50", text: "text-blue-600" },
  { value: "AUTRE", label: "Autre", icon: MoreHorizontal, bg: "bg-slate-100", text: "text-slate-600" },
];

// Motifs valides selon le sens du mouvement — une SORTIE ne peut pas être motivée par
// une "correction/retour" (c'est le seul motif d'ENTREE), et inversement.
export const MOTIFS_SORTIE = MOTIFS.filter((m) => m.value !== "CORRECTION_INVENTAIRE");
export const MOTIFS_ENTREE = MOTIFS.filter((m) => m.value === "CORRECTION_INVENTAIRE");

export const MOTIF_VALUES_SORTIE: MotifValue[] = MOTIFS_SORTIE.map((m) => m.value);
export const MOTIF_VALUES_ENTREE: MotifValue[] = MOTIFS_ENTREE.map((m) => m.value);
export const MOTIF_VALUES: MotifValue[] = MOTIFS.map((m) => m.value);

export const MOTIF_LABELS: Record<string, string> = Object.fromEntries(MOTIFS.map((m) => [m.value, m.label]));

export const MOTIF_ICON: Record<string, MotifConfig> = Object.fromEntries(MOTIFS.map((m) => [m.value, m]));

// État produit résultant de chaque motif — utilisé pour StockMouvementLigne.etatArrivee.
// REMPLACEMENT_DEFECTUEUX et AUTRE ont chacun leur propre état : ni l'un ni l'autre
// n'est une vente, contrairement à l'ancien mapping qui comptait les deux comme "VENDU".
export const ETAT_PAR_MOTIF_SORTIE: Record<Exclude<MotifValue, "CORRECTION_INVENTAIRE">, "VENDU" | "EN_TRANSFORMATION" | "UTILISE_INTERNE" | "RETIRE_DEFECTUEUX" | "SORTIE_AUTRE"> = {
  VENTE: "VENDU",
  TRANSFORMATION: "EN_TRANSFORMATION",
  USAGE_INTERNE: "UTILISE_INTERNE",
  REMPLACEMENT_DEFECTUEUX: "RETIRE_DEFECTUEUX",
  AUTRE: "SORTIE_AUTRE",
};

// Une ENTREE (motif CORRECTION_INVENTAIRE uniquement) remet toujours le produit en stock brut.
export const ETAT_ENTREE = "EN_STOCK_BRUT" as const;

// Objets complets pour la création de MouvementStock — utilisés dans la route API.
// Les valeurs de `type` correspondent à l'enum MouvementType du schéma Prisma.
export const MOUVEMENT_PAR_MOTIF_SORTIE: Record<
  Exclude<MotifValue, "CORRECTION_INVENTAIRE">,
  { type: "VENTE" | "USAGE_INTERNE" | "REMPLACEMENT_DEFECTUEUX" | "CORRECTION_INVENTAIRE"; etatArrivee: string }
> = {
  VENTE:                    { type: "VENTE",                    etatArrivee: "VENDU" },
  TRANSFORMATION:           { type: "VENTE",                    etatArrivee: "EN_TRANSFORMATION" },
  USAGE_INTERNE:            { type: "USAGE_INTERNE",            etatArrivee: "UTILISE_INTERNE" },
  REMPLACEMENT_DEFECTUEUX:  { type: "REMPLACEMENT_DEFECTUEUX",  etatArrivee: "RETIRE_DEFECTUEUX" },
  AUTRE:                    { type: "VENTE",                    etatArrivee: "SORTIE_AUTRE" },
};

export const MOUVEMENT_ENTREE = { type: "CORRECTION_INVENTAIRE" as const, etatArrivee: ETAT_ENTREE };
