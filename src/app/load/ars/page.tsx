"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MonthlySnapshot, PesoAccount } from "@/lib/types";
import { formatMonth, formatARS } from "@/lib/calculations";

interface AccountRow {
  id?: string;
  name: string;
  amount: string;
}

function ARSForm() {
  const searchParams = useSearchParams();
  const month = searchParams.get("month") ?? "";
  const [snapshot, setSnapshot] = useState<MonthlySnapshot | null>(null);
  const [accounts, setAccounts] = useState<AccountRow[]>([{ name: "", amount: "" }]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!month) { setLoading(false); return; }
    fetch(`/api/snapshots/month/${month}`)
      .then((r) => r.json())
      .then((data: MonthlySnapshot | null) => {
        setSnapshot(data);
        if (data && data.pesoAccounts.length > 0) {
          setAccounts(data.pesoAccounts.map((a: PesoAccount) => ({ id: a.id, name: a.name, amount: String(a.amount) })));
        } else {
          setAccounts([{ name: "", amount: "" }]);
        }
        setLoading(false);
      });
  }, [month]);

  function addRow() {
    setAccounts([...accounts, { name: "", amount: "" }]);
  }

  function removeRow(i: number) {
    setAccounts(accounts.filter((_, idx) => idx !== i));
  }

  function updateRow(i: number, field: "name" | "amount", value: string) {
    setAccounts(accounts.map((a, idx) => idx === i ? { ...a, [field]: value } : a));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!snapshot) return;
    setSaving(true);
    const validAccounts = accounts.filter((a) => a.name.trim() && a.amount);
    await fetch(`/api/snapshots/${snapshot.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...snapshot,
        pesoAccounts: validAccounts.map((a) => ({ name: a.name.trim(), amount: parseFloat(a.amount) || 0 })),
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const total = accounts.reduce((s, a) => s + (parseFloat(a.amount) || 0), 0);

  if (loading) return <div className="p-6 text-slate-400">Cargando...</div>;
  if (!month) return <div className="p-6 text-slate-400">Seleccioná un mes.</div>;
  if (!snapshot) return <div className="p-6 text-slate-400">No existe snapshot para {month}.</div>;

  return (
    <div className="p-4 lg:p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Saldos ARS</h1>
      <p className="text-slate-500 text-sm mb-6">{formatMonth(month)}</p>

      <form onSubmit={handleSave} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="space-y-3">
          {accounts.map((a, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={a.name}
                onChange={(e) => updateRow(i, "name", e.target.value)}
                placeholder="Nombre de cuenta"
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="number"
                step="1"
                value={a.amount}
                onChange={(e) => updateRow(i, "amount", e.target.value)}
                placeholder="Monto $"
                className="w-36 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="text-rose-400 hover:text-rose-600 text-lg font-bold px-1"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addRow}
          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          + Agregar cuenta
        </button>

        <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
          <span className="text-sm text-slate-600">Total: <strong>{formatARS(total)}</strong></span>
          <button
            type="submit"
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? "Guardando..." : saved ? "✅ Guardado" : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function LoadARSPage() {
  return <Suspense fallback={<div className="p-6 text-slate-400">Cargando...</div>}><ARSForm /></Suspense>;
}
