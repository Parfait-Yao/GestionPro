"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

const data = [
  { name: "En stock brut", value: 45, color: "#2E6DA4" },
  { name: "Transformé", value: 25, color: "#E67E22" },
  { name: "Vendu", value: 20, color: "#27AE60" },
  { name: "Usage interne", value: 10, color: "#8B5CF6" },
];

export function GraphiqueEtat() {
  const total = data.reduce((a, d) => a + d.value, 0);
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
        <p className="text-xl font-bold text-text-main">{total}%</p>
      </div>
    </div>
  );
}
