import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

type Activite = {
  id: string;
  type: "reception" | "sortie" | "alerte" | "pointage";
  titre: string;
  detail: string;
  temps: string;
};

const dotColor: Record<Activite["type"], string> = {
  reception: "bg-success",
  sortie: "bg-accent",
  alerte: "bg-danger",
  pointage: "bg-primary",
};

export function ActiviteRecente({ items }: { items: Activite[] }) {
  return (
    <div className="space-y-5">
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-3">
          <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", dotColor[item.type])} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold text-text-main">{item.titre}</p>
              <span className="shrink-0 text-xs text-text-muted">{item.temps}</span>
            </div>
            <p className="truncate text-xs text-text-muted">{item.detail}</p>
          </div>
          {item.type === "alerte" && (
            <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-text-muted" />
          )}
        </div>
      ))}
    </div>
  );
}
