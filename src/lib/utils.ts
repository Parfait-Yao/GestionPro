import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNowStrict } from "date-fns";
import { fr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, pattern = "dd MMM yyyy HH:mm") {
  return format(new Date(date), pattern, { locale: fr });
}

export function formatRelative(date: Date | string) {
  return formatDistanceToNowStrict(new Date(date), {
    addSuffix: true,
    locale: fr,
  });
}

export function formatQte(n: number, unite = "unités") {
  return `${new Intl.NumberFormat("fr-FR").format(n)} ${unite}`;
}

export function formatPct(n: number) {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

export function libelleEcart(ecart: number) {
  if (ecart === 0) return "Conforme";
  const n = Math.abs(ecart);
  const unite = n > 1 ? "unités" : "unité";
  return ecart < 0 ? `Il manque ${n} ${unite}` : `${n} ${unite} en trop`;
}
