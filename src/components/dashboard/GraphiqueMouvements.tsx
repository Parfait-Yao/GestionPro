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

const data = [
  { jour: "1", mouvements: 40 }, { jour: "5", mouvements: 65 },
  { jour: "10", mouvements: 52 }, { jour: "15", mouvements: 78 },
  { jour: "20", mouvements: 61 }, { jour: "25", mouvements: 95 },
  { jour: "30", mouvements: 88 },
];

export function GraphiqueMouvements() {
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
        <YAxis tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
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
