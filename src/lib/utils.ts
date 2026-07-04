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

export function calculerPesee(input: {
  poidsEchantillon: number;
  nbUnitesEchantillon: number;
  poidsCartonPlein: number;
  tarreUtilisee: number;
  quantiteAttendue?: number | null;
}) {
  const { poidsEchantillon: pe, nbUnitesEchantillon: ne, poidsCartonPlein: pc, tarreUtilisee: tare, quantiteAttendue: attendu } = input;
  if (!pe || !ne || !pc) return null;

  const poidsUnitaire = pe / ne;
  const poidsNet = pc - (tare || 0);
  const quantiteEstimee = Math.round(poidsNet / poidsUnitaire);
  const marge = Math.max(1, Math.round(quantiteEstimee * 0.02));
  const intervalleMin = quantiteEstimee - marge;
  const intervalleMax = quantiteEstimee + marge;

  const ecartPct = attendu ? ((quantiteEstimee - attendu) / attendu) * 100 : null;

  return { poidsUnitaire, poidsNet, quantiteEstimee, intervalleMin, intervalleMax, ecartPct };
}
