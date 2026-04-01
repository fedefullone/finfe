"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MonthlySnapshot } from "@/lib/types";
import { formatMonth } from "@/lib/calculations";

function ContextForm() {
  const searchParams = useSearchParams();
  const month = searchParams.get("month") ?? "";
  const [snapshot, setSnapshot] = useState<MonthlySnapshot | null>(null);
  const [inflation, setInflation] = useState("");
  const [mepRate, setMepRate] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!month) { setLoading(false); return; }
    fetch(`/api/snapshots/month/${month}`)
      .then((r) => r.json())
      .then((data) => {
        setSnapshot(data);
        if (data) {
          setInflation(String(data.inflation));
          setMepRate(String(data.mepRate));
        }
        setLoading(false);
      });
  }, [month]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!snapshot) return;
    setSaving(true);
    await fetch(`/api/snapshots/${snapshot.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...snapshot,
        inflation: parseFloat(inflation) || 0,
        mepRate: parseFloat(mepRate) || 0,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <div className="p-6 text-slate-400">Cargando...</div>;
  if (!month) return <div className="p-6 text-slate-400">Seleccioná un mes desde la barra lateral.</div>;
  if (!snapshot) return <div className="p-6 text-slate-400">No existe snapshot para {month}. Crealo desde la barra lateral.</div>;

  return (
    <div className="p-4 lg:p-8 max-w-lg">
      <h1 className="text-2xl font-bold mb-1">Contexto</h1>
      <p className="text-slate-500 text-sm mb-6">{formatMonth(month)}</p>

      <form onSubmit={handleSave} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Inflación del mes (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={inflation}
            onChange={(e) => setInflation(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="ej: 3.5"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tipo de cambio MEP (ARS/USD)
          </label>
          <input
            type="number"
            step="1"
            value={mepRate}
            onChange={(e) => setMepRate(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="ej: 1100"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? "Guardando..." : saved ? "✅ Guardado" : "Guardar"}
        </button>
      </form>
    </div>
  );
}

export default function ContextPage() {
  return <Suspense fallback={<div className="p-6 text-slate-400">Cargando...</div>}><ContextForm /></Suspense>;
}
