"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Boxes } from "lucide-react";
import { PinInput } from "@/components/auth/PinInput";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!nom.trim() || code.length !== 6) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: nom.trim(), code }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Identifiants incorrects");
      } else {
        toast.success("Connexion réussie. Bienvenue !");
        router.push("/dashboard");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#16192b] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-white shadow-lg">
            <Boxes className="h-7 w-7" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white">StockApp CI</h1>
            <p className="text-sm text-white/60">Gestion de stock en temps réel</p>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur">
          <label className="mb-1.5 block text-sm font-medium text-white/60">
            Nom (en majuscules)
          </label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="ex. BROU STEVEN"
            className="mb-6 h-11 w-full rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-accent"
          />

          <label className="mb-3 block text-center text-sm font-medium text-white/60">
            Code (6 chiffres)
          </label>
          <PinInput value={code} onChange={setCode} />

          <Button
            className="mt-8 w-full"
            variant="accent"
            size="lg"
            loading={loading}
            disabled={!nom.trim() || code.length !== 6}
            onClick={handleSubmit}
          >
            Se connecter
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-white/60">
          Accès réservé au gérant — connexion sécurisée
        </p>
      </div>
    </div>
  );
}