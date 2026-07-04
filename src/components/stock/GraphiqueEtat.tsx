"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

export type RepartitionEtat = { name: string; value: number; color: string };

export function GraphiqueEtat({ data }: { data: RepartitionEtat[] }) {
  const total = data.reduce((a, d) => a + d.value, 0);

  if (data.length === 0) {
    return (
      <div className="flex h-[220px] flex-col items-center justify-center gap-2 text-text-muted">
        <PieChartIcon className="h-8 w-8 opacity-30" />
        <p className="text-sm">Aucune donnée de stock</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={62} outerRadius={90} paddingAngle={3}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} stroke="none" />
            ))}
          </Pie>
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            iconType="circle"
            wrapperStyle={{ fontSize: 12, color: "#64748B" }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute left-[26%] top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="text-xs text-text-muted">Total</p>
        <p className="text-xl font-bold text-text-main">{Math.round(total)}%</p>
      </div>
    </div>
  );
}
