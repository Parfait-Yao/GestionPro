import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

type Accent = "primary" | "accent" | "success" | "danger" | "info" | "warning";

const ACCENT_ICON: Record<Accent, string> = {
  primary: "kpi-primary",
  accent: "kpi-accent",
  success: "kpi-success",
  danger: "kpi-danger",
  info: "kpi-info",
  warning: "kpi-warning",
};

export function KpiCard({
  label,
  value,
  unit,
  variation,
  icon: Icon,
  accent = "primary",
}: {
  label: string;
  value: string;
  unit?: string;
  variation?: number;
  icon: LucideIcon;
  accent?: Accent;
}) {
  const positive = (variation ?? 0) >= 0;

  return (
    <div className="card-hover card-shadow rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", ACCENT_ICON[accent])}>
            <Icon className="h-[18px] w-[18px]" />
          </div>
          <p className="text-sm font-medium text-text-muted">{label}</p>
        </div>
        {variation !== undefined && (
          <div className={cn("flex shrink-0 items-center gap-0.5 text-xs font-semibold",
            positive ? "text-success" : "text-danger"
          )}>
            {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(variation)}%
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-3xl font-bold text-text-main tracking-tight">{value}</p>
        {unit && <p className="text-xs text-text-muted mt-1">{unit}</p>}
      </div>
    </div>
  );
}
