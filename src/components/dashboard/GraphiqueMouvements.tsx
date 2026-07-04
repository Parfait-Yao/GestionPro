"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Activity } from "lucide-react";

export type PointMouvement = { jour: string; mouvements: number };

export function GraphiqueMouvements({ data }: { data: PointMouvement[] }) {
  const total = data.reduce((a, d) => a + d.mouvements, 0);

  if (total === 0) {
    return (
      <div className="flex h-[260px] flex-col items-center justify-center gap-2 text-text-muted">
        <Activity className="h-8 w-8 opacity-30" />
        <p className="text-sm">Aucun mouvement de stock sur les 30 derniers jours</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorMvt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F9772F" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#F9772F" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis dataKey="jour" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ borderRadius: 8, borderColor: "#E2E8F0", fontSize: 12 }}
          labelFormatter={(l) => `Jour ${l}`}
        />
        <Area
          type="monotone"
          dataKey="mouvements"
          stroke="#F9772F"
          strokeWidth={2}
          fill="url(#colorMvt)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
