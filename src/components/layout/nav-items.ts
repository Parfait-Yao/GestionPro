import {
  LayoutDashboard,
  PackagePlus,
  Boxes,
  ClipboardCheck,
  AlertTriangle,
  Package,
  Settings,
  FileText,
  Users,
  Truck,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badgeKey?: "sorties" | "alertes" | "commandes";
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

export const navSections: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Mouvements de stock", href: "/pointage", icon: ClipboardCheck, badgeKey: "sorties" },
      { label: "Produits", href: "/produits", icon: Package },
    ],
  },
  {
    title: "Stock & Logistique",
    items: [
      { label: "Réceptions", href: "/receptions", icon: PackagePlus },
      { label: "Stock", href: "/stock", icon: Boxes },
    ],
  },
  {
    title: "Équipe",
    items: [
      { label: "Employés", href: "/employes", icon: Users },
    ],
  },
  {
    title: "Commercial",
    items: [
      { label: "Commandes", href: "/commandes", icon: ShoppingBag, badgeKey: "commandes" },
      { label: "Livreurs", href: "/livreurs", icon: Truck },
    ],
  },
  {
    title: "Suivi",
    items: [
      { label: "Alertes", href: "/alertes", icon: AlertTriangle, badgeKey: "alertes" },
      { label: "Rapports", href: "/rapports", icon: FileText },
    ],
  },
  {
    title: "Système",
    items: [
      { label: "Paramètres", href: "/parametres", icon: Settings },
    ],
  },
];

export const navItems: NavItem[] = navSections.flatMap((s) => s.items);
