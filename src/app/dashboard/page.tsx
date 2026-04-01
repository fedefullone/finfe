"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import StatCard from "@/components/StatCard";
import { MonthlySnapshot } from "@/lib/types";
import {
  calcMetrics,
  calcReturnMetrics,
  formatARS,
  formatUSD,
  formatPct,
  formatMonth,
} from "@/lib/calculations";

const PatrimonioChart = dynamic(
  () => import("@/components/charts/PatrimonioChart"),
  { ssr: false }
);
const ComposicionChart = dynamic(
  () => import("@/components/charts/ComposicionChart"),
  { ssr: false }
);
const VariacionChart = dynamic(
  () => import("@/components/charts/VariacionChart"),
  { ssr: false }
);

function DashboardContent() {
  const searchParams = useSearchParams();
  const month = searchParams.get("month") ?? "";
  const [all, setAll] = useState<MonthlySnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/snapshots")
      .then((r) => r.json())
      .then((data) => {
        setAll(data);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="p-6 text-slate-400">Cargando...</div>
    );

  const sorted = [...all].sort((a, b) => a.month.localeCompare(b.month));
  const current = sorted.find((s) => s.month === month) ?? sorted[sorted.length - 1];
  const prevIdx = current ? sorted.indexOf(current) - 1 : -1;
  const prev = prevIdx >= 0 ? sorted[prevIdx] : null;

  if (!current) {
    return (
      <div className="p-6 text-slate-400">
        No hay datos. Crea un mes desde la barra lateral.
      </div>
    );
  }

  const m = calcMetrics(current);
  const pm = prev ? calcMetrics(prev) : null;
  const ret = prev ? calcReturnMetrics(current, prev) : null;

  const variacionUSD = pm ? m.consolidatedUSD - pm.consolidatedUSD : 0;
  const variacionPct = pm && pm.consolidatedUSD > 0
    ? (variacionUSD / pm.consolidatedUSD) * 100
    : 0;

  const totalArsPct =
    m.consolidatedUSD > 0
      ? ((m.arsNetWorth / current.mepRate) / m.consolidatedUSD) * 100
      : 0;
  const totalUsdPct = 100 - totalArsPct;

  // Historical chart data
  const chartData = sorted.map((s) => {
    const sm = calcMetrics(s);
    return {
      month: s.month,
      consolidadoUSD: parseFloat(sm.consolidatedUSD.toFixed(2)),
    };
  });

  const variacionData = sorted.slice(1).map((s, i) => {
    const sm = calcMetrics(s);
    const pm2 = calcMetrics(sorted[i]);
    return {
      month: s.month,
      variacion: parseFloat((sm.consolidatedUSD - pm2.consolidatedUSD).toFixed(2)),
    };
  });

  const composicionData = [
    {
      name: "ARS (en USD)",
      value: parseFloat((m.arsNetWorth / current.mepRate).toFixed(2)),
      color: "#6366f1",
    },
    {
      name: "USD",
      value: parseFloat(m.usdNetWorth.toFixed(2)),
      color: "#3b82f6",
    },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard General</h1>
          <p className="text-slate-500 text-sm">{formatMonth(current.month)}</p>
        </div>
        <div className="text-right text-sm text-slate-500">
          <div>MEP: {formatARS(current.mepRate)}</div>
          <div>Inflación: {current.inflation}%</div>
        </div>
      </div>

      {/* Patrimonio */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Patrimonio ARS"
          value={formatARS(m.arsNetWorth)}
          sub={pm ? `Ant: ${formatARS(pm.arsNetWorth)}` : undefined}
          accent
        />
        <StatCard
          label="Patrimonio USD"
          value={formatUSD(m.usdNetWorth)}
          sub={pm ? `Ant: ${formatUSD(pm.usdNetWorth)}` : undefined}
          accent
        />
        <StatCard
          label="Consolidado USD"
          value={formatUSD(m.consolidatedUSD)}
          sub={pm ? `Ant: ${formatUSD(pm.consolidatedUSD)}` : undefined}
          positive={m.consolidatedUSD > (pm?.consolidatedUSD ?? 0)}
          negative={m.consolidatedUSD < (pm?.consolidatedUSD ?? 0)}
        />
        <StatCard
          label="Variación mensual"
          value={`${formatUSD(variacionUSD)} (${formatPct(variacionPct)})`}
          positive={variacionUSD >= 0}
          negative={variacionUSD < 0}
        />
      </div>

      {/* Deudas e Ingresos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Deudas ARS" value={formatARS(m.arsDebts)} negative={m.arsDebts > 0} />
        <StatCard label="Deudas USD" value={formatUSD(m.usdDebts)} negative={m.usdDebts > 0} />
        <StatCard label="Sueldo" value={formatARS(current.salary)} positive />
        <StatCard label="Otros ingresos" value={formatARS(current.otherIncome)} positive />
      </div>

      {/* Rendimiento real */}
      {ret && (
        <div className={`rounded-xl border-2 p-4 ${ret.beatInflation ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50"}`}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wide text-slate-600">
                Rendimiento Real del Capital
              </h3>
              <div className="mt-2 space-y-1">
                <div className="text-sm text-slate-600">
                  Capital inicial: <strong>{formatUSD(ret.capitalInicial)}</strong>
                </div>
                <div className="text-sm text-slate-600">
                  Capital final (sin ingresos): <strong>{formatUSD(ret.capitalFinal)}</strong>
                </div>
                <div className="text-sm text-slate-600">
                  Retorno nominal: <strong className={ret.nominalReturnPct >= 0 ? "text-emerald-700" : "text-rose-700"}>{formatPct(ret.nominalReturnPct)}</strong>
                </div>
                <div className="text-sm text-slate-600">
                  Inflación del mes: <strong>{current.inflation}%</strong>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${ret.beatInflation ? "text-emerald-600" : "text-rose-600"}`}>
                {formatPct(ret.realReturnPct)}
              </div>
              <div className={`text-sm font-medium mt-1 ${ret.beatInflation ? "text-emerald-600" : "text-rose-600"}`}>
                {ret.beatInflation ? "✅ Le ganó a la inflación" : "❌ Perdió contra la inflación"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Composición */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-700 mb-2">
          Composición: {totalArsPct.toFixed(1)}% ARS / {totalUsdPct.toFixed(1)}% USD
        </h3>
        <ComposicionChart segments={composicionData} />
      </div>

      {/* Evolución */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-700 mb-4">Evolución del patrimonio (USD consolidado)</h3>
        <PatrimonioChart data={chartData} />
      </div>

      {/* Variación */}
      {variacionData.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-700 mb-4">Variación mensual (USD)</h3>
          <VariacionChart data={variacionData} />
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-400">Cargando...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
