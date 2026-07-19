"use client";

import { useState, useRef, useEffect } from "react";
import { Palette, Check } from "lucide-react";
import { useTheme, THEMES } from "@/hooks/useTheme";

export function ThemeSwitcher() {
  const { theme, setTheme, current } = useTheme();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const lightThemes = THEMES.filter((t) => !t.dark);
  const darkThemes = THEMES.filter((t) => t.dark);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        !btnRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      {/* ── Bouton déclencheur ── */}
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        title="Changer le thème"
        aria-label="Sélecteur de thème"
        className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface transition-all duration-200 hover:scale-105 hover:shadow-md"
        style={{ boxShadow: open ? `0 0 0 2px ${current.primary}40` : undefined }}
      >
        {/* pastille couleur du thème actif */}
        <span
          className="absolute inset-0 rounded-full opacity-20 transition-opacity group-hover:opacity-30"
          style={{ background: current.primary }}
        />
        <Palette
          className="relative h-4 w-4 transition-transform duration-300"
          style={{ color: current.primary }}
        />
      </button>

      {/* ── Panel ── */}
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-13 z-50 w-72 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          style={{ boxShadow: `0 20px 60px rgba(0,0,0,0.18), 0 0 0 1px ${current.primary}20` }}
        >
          {/* En-tête du panel */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ background: `linear-gradient(135deg, ${current.primary}22, ${current.bg}80)` }}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{current.icon}</span>
              <div>
                <p className="text-xs font-semibold text-text-main">Apparence</p>
                <p className="text-xs text-text-muted">{current.name}</p>
              </div>
            </div>
            {/* Indicateur gradient */}
            <div
              className="h-2 w-16 rounded-full"
              style={{ background: `linear-gradient(90deg, ${current.primary}, ${current.bg === "#f0f4ff" ? "#f97316" : current.primary}88)` }}
            />
          </div>

          <div className="p-3">
            {/* Thèmes clairs */}
            <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-widest text-text-muted">
              ☀️ Thèmes clairs
            </p>
            <div className="mb-3 grid grid-cols-5 gap-2">
              {lightThemes.map((t) => (
                <ThemeSwatch
                  key={t.id}
                  t={t}
                  active={theme === t.id}
                  onSelect={() => { setTheme(t.id); setOpen(false); }}
                />
              ))}
            </div>

            {/* Thèmes sombres */}
            <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-widest text-text-muted">
              🌙 Thèmes sombres
            </p>
            <div className="grid grid-cols-5 gap-2">
              {darkThemes.map((t) => (
                <ThemeSwatch
                  key={t.id}
                  t={t}
                  active={theme === t.id}
                  onSelect={() => { setTheme(t.id); setOpen(false); }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ThemeSwatch({
  t,
  active,
  onSelect,
}: {
  t: (typeof THEMES)[0];
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      title={t.name}
      className="group flex flex-col items-center gap-1.5 rounded-xl p-1.5 transition-all duration-150 hover:bg-surface"
    >
      {/* Pastille : fond = bg du thème + bande basse = primary */}
      <span
        className="relative flex h-9 w-9 overflow-hidden rounded-full border-2 transition-all duration-200"
        style={{
          backgroundColor: t.bg,
          borderColor: active ? t.primary : "transparent",
          boxShadow: active
            ? `0 0 0 2px ${t.primary}60, 0 4px 14px ${t.primary}50`
            : "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        {/* Bande primary en bas (accent de couleur) */}
        <span
          className="absolute bottom-0 left-0 right-0 h-[38%]"
          style={{ background: t.primary, opacity: 0.85 }}
        />
        {/* Emoji ou check au centre */}
        <span className="relative z-10 flex h-full w-full items-center justify-center">
          {active ? (
            <Check
              className="h-4 w-4 drop-shadow"
              style={{ color: t.dark ? "#fff" : "#fff" }}
              strokeWidth={3}
            />
          ) : (
            <span className="text-sm leading-none drop-shadow">{t.icon}</span>
          )}
        </span>
      </span>
      <span
        className="text-[10px] font-medium leading-none text-text-muted transition-colors group-hover:text-text-main"
        style={active ? { color: t.primary } : {}}
      >
        {t.name}
      </span>
    </button>
  );
}

