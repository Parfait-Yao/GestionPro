import { cn } from "@/lib/utils";

type Creneau = {
  employe: string;
  debut: number; // heure décimale ex 9.5
  fin: number;
  suspect: boolean;
};

const HOUR_START = 7;
const HOUR_END = 18;
const NAME_COL = "w-20 sm:w-28";

function formatHeure(h: number) {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return mm === 0 ? `${hh}h` : `${hh}h${String(mm).padStart(2, "0")}`;
}

export function CroisementTimeline({ creneaux }: { creneaux: Creneau[] }) {
  const totalH = HOUR_END - HOUR_START;
  const hours = Array.from({ length: totalH + 1 }, (_, i) => HOUR_START + i);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          Présences sur la période
        </span>
        <div className="flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" /> Déclarée
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-danger" /> Sans déclaration
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/60 p-4">
        <div className="flex">
          <div className={cn(NAME_COL, "shrink-0")} />
          <div className="flex flex-1 justify-between border-b border-border pb-1.5 text-[11px] text-text-muted">
            {hours.map((h) => (
              <span key={h}>{h}h</span>
            ))}
          </div>
        </div>

        <div className="mt-3 space-y-3">
          {creneaux.map((c, i) => {
            const left = ((c.debut - HOUR_START) / totalH) * 100;
            const width = ((c.fin - c.debut) / totalH) * 100;
            return (
              <div key={i} className="flex items-center gap-3">
                <span className={cn(NAME_COL, "shrink-0 truncate text-xs font-medium text-text-main")}>
                  {c.employe}
                </span>
                <div className="relative h-8 flex-1">
                  <div className="absolute inset-0 flex justify-between">
                    {hours.map((h) => (
                      <div key={h} className="h-full w-px bg-border" />
                    ))}
                  </div>
                  <div
                    style={{ left: `${left}%`, width: `${width}%` }}
                    className={cn(
                      "absolute top-1 flex h-6 min-w-fit items-center justify-center whitespace-nowrap rounded-full px-2.5 text-[11px] font-semibold text-white shadow-sm",
                      c.suspect ? "bg-danger" : "bg-primary/80"
                    )}
                  >
                    {formatHeure(c.debut)}–{formatHeure(c.fin)}
                  </div>
                </div>
                {c.suspect && (
                  <span className="hidden shrink-0 text-right text-xs font-medium text-danger sm:block">
                    sans déclaration
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
