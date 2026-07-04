import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function RadioCard({
  label,
  description,
  icon: Icon,
  selected,
  onClick,
}: {
  label: string;
  description?: string;
  icon?: LucideIcon;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-[44px] items-start gap-3 rounded-md border p-3 text-left transition-colors",
        selected ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-surface"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
          selected ? "border-primary" : "border-border"
        )}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
      </span>
      {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />}
      <span>
        <span className="block text-sm font-medium text-text-main">{label}</span>
        {description && <span className="block text-xs text-text-muted">{description}</span>}
      </span>
    </button>
  );
}
