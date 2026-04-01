"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MonthlySnapshot } from "@/lib/types";
import {
  calcMetrics,
  calcReturnMetrics,
  formatARS,
  formatUSD,
  formatPct,
  formatMonth,
} from "@/lib/calculations";

export default function HistoryPage() {
  const [snapshots, setSnapshots] = useState<MonthlySnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/snapshots")
      .then((r) => r.json())
      .then((data) => { setSnapshots(data); setLoading(false); });
  }, []);

  async function handleDelete(id: string, month: string) {
    if (!confirm(`¿Eliminar ${formatMonth(month)}?`)) return;
    setDeleting(id);
    await fetch(`/api/snapshots/${id}`, { method: "DELETE" });
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
    setDeleting(null);
  }

  if (loading) return <div className="p-6 text-slate-400">Cargando...</div>;

  const sorted = [...snapshots].sort((a, b) => a.month.localeCompare(b.month));

  return (
    <div className="p-4 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Histórico</h1>
          <p className="text-slate-500 text-sm">{snapshots.length} meses registrados</p>
        </div>
        <a
          href="/api/export"
          className="bg-slate-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
        >
          Exportar JSON
        </a>
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Mes</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Patrimonio ARS</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Patrimonio USD</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Consolidado USD</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Deudas ARS</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Deudas USD</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Variación</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Real vs inflación</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, i) => {
              const m = calcMetrics(s);
              const prev = i > 0 ? sorted[i - 1] : null;
              const pm = prev ? calcMetrics(prev) : null;
              const variacion = pm ? m.consolidatedUSD - pm.consolidatedUSD : null;
              const variacionPct = pm && pm.consolidatedUSD !== 0 ? (variacion! / Math.abs(pm.consolidatedUSD)) * 100 : null;
              const ret = prev ? calcReturnMetrics(s, prev) : null;

              return (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{formatMonth(s.month)}</td>
                  <td className="px-4 py-3 text-right">{formatARS(m.arsNetWorth)}</td>
                  <td className="px-4 py-3 text-right">{formatUSD(m.usdNetWorth)}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatUSD(m.consolidatedUSD)}</td>
                  <td className="px-4 py-3 text-right text-rose-600">{formatARS(m.arsDebts)}</td>
                  <td className="px-4 py-3 text-right text-rose-600">{formatUSD(m.usdDebts)}</td>
                  <td className={`px-4 py-3 text-right ${variacion === null ? "text-slate-400" : variacion >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {variacion === null ? "—" : (
                      <span>
                        {variacion >= 0 ? "+" : ""}{formatUSD(variacion)}
                        <span className="block text-xs opacity-75">{formatPct(variacionPct!)}</span>
                      </span>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-right ${!ret ? "text-slate-400" : ret.beatInflation ? "text-emerald-600" : "text-rose-600"}`}>
                    {ret ? `${ret.beatInflation ? "✅" : "❌"} ${formatPct(ret.realReturnPct)}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/load/context?month=${s.month}`}
                        className="text-xs text-slate-500 hover:text-emerald-600 font-medium"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(s.id, s.month)}
                        disabled={deleting === s.id}
                        className="text-xs text-rose-400 hover:text-rose-600 font-medium disabled:opacity-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {sorted.map((s, i) => {
          const m = calcMetrics(s);
          const prev = i > 0 ? sorted[i - 1] : null;
          const pm = prev ? calcMetrics(prev) : null;
          const variacion = pm ? m.consolidatedUSD - pm.consolidatedUSD : null;
          const variacionPct = pm && pm.consolidatedUSD !== 0 ? (variacion! / Math.abs(pm.consolidatedUSD)) * 100 : null;
          const ret = prev ? calcReturnMetrics(s, prev) : null;

          return (
            <div key={s.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold">{formatMonth(s.month)}</h3>
                <div className="flex gap-2">
                  <Link href={`/load/context?month=${s.month}`} className="text-xs text-slate-500 hover:text-emerald-600">Editar</Link>
                  <button onClick={() => handleDelete(s.id, s.month)} className="text-xs text-rose-400 hover:text-rose-600">Eliminar</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-slate-500">ARS:</span> {formatARS(m.arsNetWorth)}</div>
                <div><span className="text-slate-500">USD:</span> {formatUSD(m.usdNetWorth)}</div>
                <div><span className="text-slate-500">Consolidado:</span> {formatUSD(m.consolidatedUSD)}</div>
                {variacion !== null && (
                  <div className={variacion >= 0 ? "text-emerald-600" : "text-rose-600"}>
                    <span className="text-slate-500">Var:</span> {variacion >= 0 ? "+" : ""}{formatUSD(variacion)} ({formatPct(variacionPct!)})
                  </div>
                )}
                {ret && (
                  <div className={`col-span-2 ${ret.beatInflation ? "text-emerald-600" : "text-rose-600"}`}>
                    Rendimiento real: {ret.beatInflation ? "✅" : "❌"} {formatPct(ret.realReturnPct)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {snapshots.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg">No hay datos aún.</p>
          <p className="text-sm mt-2">Creá un nuevo mes desde la barra lateral.</p>
        </div>
      )}
    </div>
  );
}
