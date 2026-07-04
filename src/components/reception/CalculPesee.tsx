"use client";

import { useMemo } from "react";
import { Scale, CheckCircle2, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn, calculerPesee } from "@/lib/utils";

export type PeseeInput = {
  poidsEchantillon: string;
  nbUnitesEchantillon: string;
  poidsCartonPlein: string;
  tareCarton: string;
  quantiteAttendue: string;
  seuilTolerancePct: number;
};

export function CalculPesee({
  values,
  onChange,
}: {
  values: PeseeInput;
  onChange: (v: PeseeInput) => void;
}) {
  const set = (k: keyof PeseeInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...values, [k]: e.target.value });

  const calc = useMemo(() => {
    const result = calculerPesee({
      poidsEchantillon: parseFloat(values.poidsEchantillon),
      nbUnitesEchantillon: parseFloat(values.nbUnitesEchantillon),
      poidsCartonPlein: parseFloat(values.poidsCartonPlein),
      tarreUtilisee: parseFloat(values.tareCarton) || 0,
      quantiteAttendue: parseFloat(values.quantiteAttendue) || null,
    });
    if (!result) return null;

    const dansTolerance = result.ecartPct === null ? true : Math.abs(result.ecartPct) <= values.seuilTolerancePct;
    return { ...result, dansTolerance };
  }, [values]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Poids échantillon (g)" type="number" inputMode="decimal" value={values.poidsEchantillon} onChange={set("poidsEchantillon")} placeholder="ex: 250" />
        <Input label="Nb unités échantillon" type="number" inputMode="numeric" value={values.nbUnitesEchantillon} onChange={set("nbUnitesEchantillon")} placeholder="ex: 25" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Poids carton plein (g)" type="number" inputMode="decimal" value={values.poidsCartonPlein} onChange={set("poidsCartonPlein")} placeholder="ex: 5200" />
        <Input label="Tare carton (g)" type="number" inputMode="decimal" value={values.tareCarton} onChange={set("tareCarton")} placeholder="ex: 200" />
      </div>
      <Input label="Quantité attendue (bon de commande)" type="number" inputMode="numeric" value={values.quantiteAttendue} onChange={set("quantiteAttendue")} placeholder="ex: 500" />

      <div
        className={cn(
          "rounded-lg border p-4 transition-colors",
          !calc && "border-border bg-surface",
          calc && calc.dansTolerance && "border-success/30 bg-success/5",
          calc && !calc.dansTolerance && "border-danger/30 bg-danger/5"
        )}
      >
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-main">
          <Scale className="h-4 w-4 text-primary" />
          Estimation en temps réel
        </div>

        {!calc ? (
          <p className="text-sm text-text-muted">
            Renseignez l&apos;échantillon et le poids du carton pour voir l&apos;estimation.
          </p>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Quantité estimée</span>
              <span className="font-bold text-text-main">≈ {calc.quantiteEstimee} unités</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Intervalle de confiance</span>
              <span className="font-medium text-text-main">{calc.intervalleMin} – {calc.intervalleMax}</span>
            </div>
            {values.quantiteAttendue && (
              <div className="flex justify-between">
                <span className="text-text-muted">Écart vs attendu</span>
                <span className={cn("flex items-center gap-1 font-semibold", calc.dansTolerance ? "text-success" : "text-danger")}>
                  {calc.dansTolerance ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  {calc.ecartPct?.toFixed(1)}%
                </span>
              </div>
            )}
            {!calc.dansTolerance && (
              <p className="pt-1 text-xs font-medium text-danger">
                Vérification complémentaire requise avant validation.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
