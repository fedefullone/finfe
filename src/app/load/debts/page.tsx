"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MonthlySnapshot, Debt } from "@/lib/types";
import { formatMonth, formatARS, formatUSD } from "@/lib/calculations";

interface DebtRow {
  id?: string;
  name: string;
  currency: "ARS" | "USD";
  amount: string;
}

function DebtsForm() {
  const searchParams = useSearchParams();
  const month = searchParams.get("month") ?? "";
  const [snapshot, setSnapshot] = useState<MonthlySnapshot | null>(null);
  const [debts, setDebts] = useState<DebtRow[]>([{ name: "", currency: "ARS", amount: "" }]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!month) { setLoading(false); return; }
    fetch(`/api/snapshots/month/${month}`)
      .then((r) => r.json())
      .then((data: MonthlySnapshot | null) => {
        setSnapshot(data);
        if (data && data.debts.length > 0) {
          setDebts(data.debts.map((d: Debt) => ({ id: d.id, name: d.name, currency: d.currency, amount: String(d.amount) })));
        } else {
          setDebts([{ name: "", currency: "ARS", amount: "" }]);
        }
        setLoading(false);
      });
  }, [month]);

  function addRow() { setDebts([...debts, { name: "", currency: "ARS", amount: "" }]); }
  function removeRow(i: number) { setDebts(debts.filter((_, idx) => idx !== i)); }
  function updateRow(i: number, field: keyof DebtRow, value: string) {
    setDebts(debts.map((d, idx) => idx === i ? { ...d, [field]: value } : d));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!snapshot) return;
    setSaving(true);
    const valid = debts.filter((d) => d.name.trim() && d.amount);
    await fetch(`/api/snapshots/${snapshot.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...snapshot,
        debts: valid.map((d) => ({ name: d.name.trim(), currency: d.currency, amount: parseFloat(d.amount) || 0 })),
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const totalARS = debts.filter(d => d.currency === "ARS").reduce((s, d) => s + (parseFloat(d.amount) || 0), 0);
  const totalUSD = debts.filter(d => d.currency === "USD").reduce((s, d) => s + (parseFloat(d.amount) || 0), 0);

  if (loading) return <div className="p-6 text-slate-400">Cargando...</div>;
  if (!month) return <div className="p-6 text-slate-400">Seleccioná un mes.</div>;
  if (!snapshot) return <div className="p-6 text-slate-400">No existe snapshot para {month}.</div>;

  return (
    <div className="p-4 lg:p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Deudas</h1>
      <p className="text-slate-500 text-sm mb-6">{formatMonth(month)}</p>

      <form onSubmit={handleSave} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="space-y-3">
          {debts.map((d, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={d.name}
                onChange={(e) => updateRow(i, "name", e.target.value)}
                placeholder="Nombre de deuda"
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <select
                value={d.currency}
                onChange={(e) => updateRow(i, "currency", e.target.value)}
                className="border border-slate-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </select>
              <input
                type="number"
                step="1"
                value={d.amount}
                onChange={(e) => updateRow(i, "amount", e.target.value)}
                placeholder="Monto"
                className="w-32 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <button type="button" onClick={() => removeRow(i)} className="text-rose-400 hover:text-rose-600 text-lg font-bold px-1">×</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addRow} className="text-sm text-rose-600 hover:text-rose-700 font-medium">
          + Agregar deuda
        </button>
        <div className="pt-2 border-t border-slate-100">
          <div className="flex justify-between text-sm text-slate-600 mb-3">
            <span>Total ARS: <strong className="text-rose-600">{formatARS(totalARS)}</strong></span>
            <span>Total USD: <strong className="text-rose-600">{formatUSD(totalUSD)}</strong></span>
          </div>
          <button type="submit" disabled={saving} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50">
            {saving ? "Guardando..." : saved ? "✅ Guardado" : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function DebtsPage() {
  return <Suspense fallback={<div className="p-6 text-slate-400">Cargando...</div>}><DebtsForm /></Suspense>;
}
