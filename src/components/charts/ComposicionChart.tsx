"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Segment {
  name: string;
  value: number;
  color: string;
}

export default function ComposicionChart({ segments }: { segments: Segment[] }) {
  const total = segments.reduce((s, d) => s + Math.max(d.value, 0), 0);
  const data = segments.filter((s) => s.value > 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-slate-400 text-sm">
        Sin datos
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          dataKey="value"
          paddingAngle={2}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v: number) => [
            `$${v.toFixed(0)} (${((v / total) * 100).toFixed(1)}%)`,
          ]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
