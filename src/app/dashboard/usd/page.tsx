"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import StatCard from "@/components/StatCard";
import { MonthlySnapshot } from "@/lib/types";
import {
  calcMetrics,
  formatUSD,
  formatPct,
  formatMonth,
} from "@/lib/calculations";

const PatrimonioChart = dynamic(() => import("@/components/charts/PatrimonioChart"), { ssr: false });
const ComposicionChart = dynamic(() => import("@/components/charts/ComposicionChart"), { ssr: false });
const VariacionChart = dynamic(() => import("@/components/charts/VariacionChart"), { ssr: false });

function USDContent() {
  const searchParams = useSearchParams();
  const month = searchParams.get("month") ?? "";
  const [all, setAll] = useState<MonthlySnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/snapshots").then((r) => r.json()).then((d) => { setAll(d); setLoading(false); });
  }, []);

  if (loading) return <div className="p-6 text-slate-400">Cargando...</div>;

  const sorted = [...all].sort((a, b) => a.month.localeCompare(b.month));
  const current = sorted.find((s) => s.month === month) ?? sorted[sorted.length - 1];
  const prevIdx = current ? sorted.indexOf(current) - 1 : -1;
  const prev = prevIdx >= 0 ? sorted[prevIdx] : null;

  if (!current) return <div className="p-6 text-slate-400">Sin datos.</div>;

  const m = calcMetrics(current);
  const pm = prev ? calcMetrics(prev) : null;
  const variacion = pm ? m.usdNetWorth - pm.usdNetWorth : 0;
  const variacionPct = pm && pm.usdNetWorth !== 0 ? (variacion / Math.abs(pm.usdNetWorth)) * 100 : 0;

  const chartData = sorted.map((s) => ({
    month: s.month,
    consolidadoUSD: parseFloat(calcMetrics(s).usdNetWorth.toFixed(2)),
  }));

  const variacionData = sorted.slice(1).map((s, i) => ({
    month: s.month,
    variacion: parseFloat((calcMetrics(s).usdNetWorth - calcMetrics(sorted[i]).usdNetWorth).toFixed(2)),
  }));

  const composicion = current.usdAccounts.map((a, i) => ({
    name: a.name,
    value: a.amount,
    color: ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"][i % 5],
  }));

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard USD</h1>
        <p className="text-slate-500 text-sm">{formatMonth(current.month)}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Activos USD" value={formatUSD(m.usdAssets)} accent />
        <StatCard label="Deudas USD" value={formatUSD(m.usdDebts)} negative={m.usdDebts > 0} />
        <StatCard label="Patrimonio Neto USD" value={formatUSD(m.usdNetWorth)} accent positive={m.usdNetWorth > 0} />
        <StatCard
          label="Variación mensual"
          value={`${formatUSD(variacion)} (${formatPct(variacionPct)})`}
          positive={variacion >= 0}
          negative={variacion < 0}
        />
      </div>

      {composicion.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-700 mb-2">Composición por cuenta</h3>
          <ComposicionChart segments={composicion} />
        </div>
      )}

      {current.usdAccounts.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-700 mb-3">Detalle de cuentas</h3>
          <div className="space-y-2">
            {current.usdAccounts.map((a) => (
              <div key={a.id} className="flex justify-between items-center py-1 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-700">{a.name}</span>
                <span className="font-medium">{formatUSD(a.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-700 mb-4">Evolución USD</h3>
        <PatrimonioChart data={chartData} />
      </div>

      {variacionData.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-700 mb-4">Variación mensual USD</h3>
          <VariacionChart data={variacionData} />
        </div>
      )}
    </div>
  );
}

export default function DashboardUSDPage() {
  return <Suspense fallback={<div className="p-6 text-slate-400">Cargando...</div>}><USDContent /></Suspense>;
}
