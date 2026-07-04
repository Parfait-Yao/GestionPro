"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

export function PinInput({
  value,
  onChange,
  length = 6,
}: {
  value: string;
  onChange: (v: string) => void;
  length?: number;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  function setDigit(i: number, digit: string) {
    const clean = digit.replace(/\D/g, "").slice(-1);
    const chars = value.split("");
    chars[i] = clean;
    const next = chars.join("").slice(0, length);
    onChange(next);
    if (clean && i < length - 1) refs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          value={value[i] ?? ""}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          inputMode="numeric"
          maxLength={1}
          className={cn(
            "h-12 w-11 rounded-md border border-white/15 bg-white/5 text-center text-xl font-semibold text-white outline-none transition-colors sm:h-14 sm:w-12",
            "focus:border-accent focus:bg-white/10 focus:ring-2 focus:ring-accent/40"
          )}
        />
      ))}
    </div>
  );
}
