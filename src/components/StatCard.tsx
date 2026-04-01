interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
  negative?: boolean;
  accent?: boolean;
}

export default function StatCard({
  label,
  value,
  sub,
  positive,
  negative,
  accent,
}: StatCardProps) {
  return (
    <div
      className={`bg-white rounded-xl p-4 shadow-sm border ${
        accent ? "border-emerald-200" : "border-slate-100"
      }`}
    >
      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p
        className={`text-2xl font-bold ${
          positive
            ? "text-emerald-600"
            : negative
            ? "text-rose-600"
            : "text-slate-900"
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}
