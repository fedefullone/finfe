"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from "recharts";
import { formatMonth } from "@/lib/calculations";

interface DataPoint {
  month: string;
  variacion: number;
}

export default function VariacionChart({ data }: { data: DataPoint[] }) {
  const sorted = [...data].sort((a, b) => a.month.localeCompare(b.month));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={sorted} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="month"
          tickFormatter={formatMonth}
          tick={{ fontSize: 11, fill: "#64748b" }}
        />
        <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
        <Tooltip
          formatter={(v: number) => [`${v >= 0 ? "+" : ""}$${v.toFixed(0)}`, "Variación"]}
          labelFormatter={formatMonth}
        />
        <ReferenceLine y={0} stroke="#cbd5e1" />
        <Bar dataKey="variacion" radius={[4, 4, 0, 0]}>
          {sorted.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.variacion >= 0 ? "#10b981" : "#f43f5e"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
