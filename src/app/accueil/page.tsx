"use client";

import Link from "next/link";
import { LayoutDashboard, Ship, Boxes } from "lucide-react";

export default function AccueilPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-surface px-4">
      <div className="w-full max-w-2xl">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-white shadow-lg">
            <Boxes className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-text-main">StockApp CI</h1>
          <p className="text-sm text-text-muted">Que souhaitez-vous faire ?</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Link
            href="/commandes-chine"
            className="group flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center card-shadow transition-all hover:border-accent/40 hover:shadow-lg"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
              <Ship className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-main">Gestion des commandes Chine</h2>
              <p className="mt-1 text-sm text-text-muted">Suivre les commandes et leurs cartons</p>
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="group flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center card-shadow transition-all hover:border-primary/40 hover:shadow-lg"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
              <LayoutDashboard className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-main">Tableau de bord</h2>
              <p className="mt-1 text-sm text-text-muted">Suivi du stock et de l&apos;activité</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
