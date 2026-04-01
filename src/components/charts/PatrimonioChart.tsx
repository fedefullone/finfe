"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatMonth } from "@/lib/calculations";

interface DataPoint {
  month: string;
  consolidadoUSD: number;
  arsNeto?: number;
  usdNeto?: number;
}

export default function PatrimonioChart({ data }: { data: DataPoint[] }) {
  const sorted = [...data].sort((a, b) => a.month.localeCompare(b.month));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={sorted} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="month"
          tickFormatter={formatMonth}
          tick={{ fontSize: 11, fill: "#64748b" }}
        />
        <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
        <Tooltip
          formatter={(value: number) => [`$${value.toFixed(0)}`, ""]}
          labelFormatter={formatMonth}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="consolidadoUSD"
          name="Consolidado USD"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
        {data[0]?.arsNeto !== undefined && (
          <Line
            type="monotone"
            dataKey="arsNeto"
            name="Neto ARS"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        )}
        {data[0]?.usdNeto !== undefined && (
          <Line
            type="monotone"
            dataKey="usdNeto"
            name="Neto USD"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
