"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { MonthlySnapshot } from "@/lib/types";
import { formatMonth } from "@/lib/calculations";

const navItems = [
  { href: "/dashboard", label: "Dashboard General", icon: "📊" },
  { href: "/dashboard/ars", label: "Dashboard ARS", icon: "🇦🇷" },
  { href: "/dashboard/usd", label: "Dashboard USD", icon: "💵" },
  { href: "/load/context", label: "Contexto", icon: "📋" },
  { href: "/load/ars", label: "Cargar ARS", icon: "💰" },
  { href: "/load/usd", label: "Cargar USD", icon: "💲" },
  { href: "/load/income", label: "Ingresos", icon: "💼" },
  { href: "/load/debts", label: "Deudas", icon: "📉" },
  { href: "/history", label: "Histórico", icon: "📅" },
];

function SidebarInner() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [months, setMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [newMonth, setNewMonth] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/snapshots")
      .then((r) => r.json())
      .then((data: MonthlySnapshot[]) => {
        const ms = data.map((s) => s.month).sort().reverse();
        setMonths(ms);
        const fromUrl = searchParams.get("month");
        if (fromUrl && ms.includes(fromUrl)) {
          setSelectedMonth(fromUrl);
        } else if (ms.length > 0) {
          setSelectedMonth(ms[0]);
        }
      });
  }, [searchParams]);

  function handleMonthChange(m: string) {
    setSelectedMonth(m);
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", m);
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  async function handleCreateMonth() {
    if (!newMonth || !/^\d{4}-\d{2}$/.test(newMonth)) return;
    setCreating(true);
    await fetch("/api/snapshots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        month: newMonth,
        inflation: 0,
        mepRate: 1000,
        salary: 0,
        otherIncome: 0,
        pesoAccounts: [],
        usdAccounts: [],
        debts: [],
      }),
    });
    setMonths((prev) => [newMonth, ...prev].sort().reverse());
    handleMonthChange(newMonth);
    setNewMonth("");
    setCreating(false);
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white flex items-center justify-between px-4 h-14">
        <span className="font-bold text-lg">💹 Finfe</span>
        <button onClick={() => setOpen(!open)} className="p-2">
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-50 flex flex-col transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="p-4 border-b border-slate-700">
          <div className="font-bold text-xl mb-4 hidden lg:block">💹 Finfe</div>

          {/* Month selector */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400 uppercase tracking-wide">
              Mes activo
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="w-full bg-slate-800 text-white text-sm rounded px-2 py-1.5 border border-slate-700"
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {formatMonth(m)}
                </option>
              ))}
            </select>

            {/* New month */}
            <div className="flex gap-1">
              <input
                type="month"
                value={newMonth}
                onChange={(e) => setNewMonth(e.target.value.slice(0, 7))}
                className="flex-1 bg-slate-800 text-white text-xs rounded px-2 py-1.5 border border-slate-700"
                placeholder="YYYY-MM"
              />
              <button
                onClick={handleCreateMonth}
                disabled={creating}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded px-2 py-1.5 disabled:opacity-50"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={`${item.href}${selectedMonth ? `?month=${selectedMonth}` : ""}`}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                  ${isActive
                    ? "bg-emerald-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700 space-y-2">
          <a
            href="/api/export"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white"
          >
            ⬇️ Exportar JSON
          </a>
        </div>
      </aside>

      {/* Mobile padding */}
      <div className="lg:hidden h-14" />
    </>
  );
}

export default function Sidebar() {
  return (
    <Suspense fallback={null}>
      <SidebarInner />
    </Suspense>
  );
}
