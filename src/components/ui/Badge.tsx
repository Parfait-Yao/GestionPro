import { cn } from "@/lib/utils";
import {
  CheckCircle2, Clock, XCircle, AlertTriangle, ShieldAlert,
  Package, Factory, ShoppingCart, Wrench, Home, type LucideIcon,
} from "lucide-react";

type StatusConfig = { label: string; className: string; icon: LucideIcon };

const STATUS: Record<string, StatusConfig> = {
  RECU:                 { label: "Reçu",               className: "bg-slate-50 text-slate-600 border-slate-200",   icon: Package },
  EN_STOCK_BRUT:        { label: "En stock brut",       className: "bg-blue-50 text-blue-600 border-blue-200",     icon: Package },
  EN_TRANSFORMATION:    { label: "En transformation",   className: "bg-amber-50 text-amber-600 border-amber-200", icon: Factory },
  EN_STOCK_TRANSFORME:  { label: "En stock transformé", className: "bg-primary/10 text-primary border-primary/20", icon: Package },
  VENDU:                { label: "Vendu",               className: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: ShoppingCart },
  UTILISE_INTERNE:      { label: "Usage interne",       className: "bg-purple-50 text-purple-600 border-purple-200", icon: Home },
  ECART:                { label: "Écart",               className: "bg-red-50 text-red-600 border-red-200",       icon: AlertTriangle },
  EN_ATTENTE:           { label: "En attente",          className: "bg-amber-50 text-amber-600 border-amber-200", icon: Clock },
  CONFIRMEE:            { label: "Confirmée",           className: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: CheckCircle2 },
  REFUSEE:              { label: "Refusée",             className: "bg-red-50 text-red-600 border-red-200",       icon: XCircle },
  ESCALADE_PATRONNE:    { label: "Escalade patronne",   className: "bg-red-50 text-red-600 border-red-200",       icon: ShieldAlert },
  OUVERTE:              { label: "Ouverte",             className: "bg-red-50 text-red-600 border-red-200",       icon: AlertTriangle },
  EN_COURS:             { label: "En cours",            className: "bg-amber-50 text-amber-600 border-amber-200", icon: Clock },
  RESOLUE:              { label: "Résolue",             className: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: CheckCircle2 },
  CLASSEE:              { label: "Classée",             className: "bg-slate-50 text-slate-600 border-slate-200",   icon: Package },
  default:               { label: "",                    className: "bg-slate-50 text-slate-600 border-slate-200",   icon: Package },
};

export const statutLabels: Record<string, string> = Object.fromEntries(
  Object.entries(STATUS).map(([k, v]) => [k, v.label])
);

export function Badge({
  status,
  children,
  className,
  icon = true,
}: {
  status?: string;
  children: React.ReactNode;
  className?: string;
  icon?: boolean;
}) {
  const cfg = status ? STATUS[status] ?? STATUS.default : STATUS.default;
  const Icon = cfg.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        cfg.className,
        className
      )}
    >
      {icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
}
