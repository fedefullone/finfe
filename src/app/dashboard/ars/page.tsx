"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import StatCard from "@/components/StatCard";
import { MonthlySnapshot } from "@/lib/types";
import {
  calcMetrics,
  formatARS,
  formatPct,
  formatMonth,
} from "@/lib/calculations";

const PatrimonioChart = dynamic(() => import("@/components/charts/PatrimonioChart"), { ssr: false });
const ComposicionChart = dynamic(() => import("@/components/charts/ComposicionChart"), { ssr: false });
const VariacionChart = dynamic(() => import("@/components/charts/VariacionChart"), { ssr: false });

function ARSContent() {
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
  const variacionNominal = pm ? m.arsNetWorth - pm.arsNetWorth : 0;
  const variacionPct = pm && pm.arsNetWorth !== 0 ? (variacionNominal / Math.abs(pm.arsNetWorth)) * 100 : 0;
  const inflationRate = current.inflation / 100;
  const variacionReal = pm && pm.arsNetWorth !== 0
    ? ((1 + variacionPct / 100) / (1 + inflationRate) - 1) * 100
    : 0;

  const chartData = sorted.map((s) => ({
    month: s.month,
    consolidadoUSD: parseFloat(calcMetrics(s).arsNetWorth.toFixed(0)),
  }));

  const variacionData = sorted.slice(1).map((s, i) => ({
    month: s.month,
    variacion: parseFloat((calcMetrics(s).arsNetWorth - calcMetrics(sorted[i]).arsNetWorth).toFixed(0)),
  }));

  const composicion = current.pesoAccounts.map((a, i) => ({
    name: a.name,
    value: a.amount,
    color: ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"][i % 5],
  }));

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard ARS</h1>
        <p className="text-slate-500 text-sm">{formatMonth(current.month)} — Inflación: {current.inflation}%</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Activos ARS" value={formatARS(m.arsAssets)} accent />
        <StatCard label="Deudas ARS" value={formatARS(m.arsDebts)} negative={m.arsDebts > 0} />
        <StatCard label="Patrimonio Neto ARS" value={formatARS(m.arsNetWorth)} accent positive={m.arsNetWorth > 0} />
        <StatCard
          label="Variación nominal"
          value={formatPct(variacionPct)}
          sub={`${variacionNominal >= 0 ? "+" : ""}${formatARS(variacionNominal)}`}
          positive={variacionNominal >= 0}
          negative={variacionNominal < 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <StatCard
          label="Variación real (vs inflación)"
          value={formatPct(variacionReal)}
          sub={variacionReal >= 0 ? "✅ Le ganó a la inflación" : "❌ Perdió contra la inflación"}
          positive={variacionReal >= 0}
          negative={variacionReal < 0}
        />
        <StatCard
          label="Inflación del mes"
          value={`${current.inflation}%`}
          sub={pm ? `Mes ant. patrimonio: ${formatARS(pm.arsNetWorth)}` : undefined}
        />
      </div>

      {composicion.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-700 mb-2">Composición por cuenta</h3>
          <ComposicionChart segments={composicion} />
        </div>
      )}

      {current.pesoAccounts.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-700 mb-3">Detalle de cuentas</h3>
          <div className="space-y-2">
            {current.pesoAccounts.map((a) => (
              <div key={a.id} className="flex justify-between items-center py-1 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-700">{a.name}</span>
                <span className="font-medium">{formatARS(a.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-700 mb-4">Evolución ARS</h3>
        <PatrimonioChart data={chartData} />
      </div>

      {variacionData.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-700 mb-4">Variación mensual ARS</h3>
          <VariacionChart data={variacionData} />
        </div>
      )}
    </div>
  );
}

export default function DashboardARSPage() {
  return <Suspense fallback={<div className="p-6 text-slate-400">Cargando...</div>}><ARSContent /></Suspense>;
}
