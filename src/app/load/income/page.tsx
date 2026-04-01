"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MonthlySnapshot } from "@/lib/types";
import { formatMonth } from "@/lib/calculations";

function IncomeForm() {
  const searchParams = useSearchParams();
  const month = searchParams.get("month") ?? "";
  const [snapshot, setSnapshot] = useState<MonthlySnapshot | null>(null);
  const [salary, setSalary] = useState("");
  const [otherIncome, setOtherIncome] = useState("");
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
          setSalary(String(data.salary));
          setOtherIncome(String(data.otherIncome));
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
        salary: parseFloat(salary) || 0,
        otherIncome: parseFloat(otherIncome) || 0,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <div className="p-6 text-slate-400">Cargando...</div>;
  if (!month) return <div className="p-6 text-slate-400">Seleccioná un mes.</div>;
  if (!snapshot) return <div className="p-6 text-slate-400">No existe snapshot para {month}.</div>;

  return (
    <div className="p-4 lg:p-8 max-w-lg">
      <h1 className="text-2xl font-bold mb-1">Ingresos</h1>
      <p className="text-slate-500 text-sm mb-6">{formatMonth(month)}</p>

      <form onSubmit={handleSave} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Sueldo (ARS)</label>
          <input
            type="number"
            step="1"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="ej: 1500000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Otros ingresos (ARS)</label>
          <input
            type="number"
            step="1"
            value={otherIncome}
            onChange={(e) => setOtherIncome(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="ej: 100000"
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

export default function IncomePage() {
  return <Suspense fallback={<div className="p-6 text-slate-400">Cargando...</div>}><IncomeForm /></Suspense>;
}
